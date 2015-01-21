using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net.Mail;
using MongoRepository;
using parkingPass2.Data;
using parkingPass2.Rabbit;

//for csv
using System.Text;

namespace parkingPass2.Controllers
{
    public class TicketController : BaseController
    {
        static MongoRepository<Ticket> ticketrepo = new MongoRepository<Ticket>();

        //given a string, will replace any of our replacement sring with the appropriate value from our ticket
        //we use stringbuilder to avoid the performance problems of normal replaces (which builds a new string each time)
        private string decodedTemplate(Ticket ticket, string templatestring)
        {
            try
            {
                //{{client}}, {{db_url}}, {{db_link}}, {{doc_url}}, {{doc_link}}
                StringBuilder tstr = new StringBuilder(templatestring);
                string dburl = buildURL(null, null, null);
                tstr.Replace("{{db_url}}", dburl);

                //{{db_link}}
                string dblink = "<a href=\"" + dburl + "\">Parking Pass" + "</a>";
                tstr.Replace("{{db_link}}", dblink);

                //{{client}}
                tstr.Replace("{{client}}", ticket.Client.DisplayName);

                //{{comment}}
                //tstr.Replace("{{comment}}", invite.Comment);

                //{{doc_url}}
                string docurl = buildURL("Ticket", "Details", ticket.Id);
                tstr.Replace("{{db_url}}", dburl);

                //{{doc_link}}
                string doclink = "<a href=\"" + dburl + "\">Parking Pass for " + ticket.Client.DisplayName + "</a>";
                tstr.Replace("{{doc_link}}", doclink);

                return tstr.ToString();
            }
            catch
            {
                return templatestring;
            }
        }

        public bool isMyTicket(Ticket ticket)
        {
            string user = User.Identity.Name;
            string owner = "";
            if (ticket.Client.LanId != null)
            {
                owner = ticket.Client.LanId.ToLower();
            }

            //we want to correct for user names in the form AA\tpmurphy
            if (user.Contains("\\"))
            {
                user = user.Substring(3).ToLower();
            }

            return (user == owner);
        }

        // will return the pass for current user, or else return null
        public Ticket getMyTicket()
        {
            try
            {
                string user = User.Identity.Name.ToLower();
                //we want to correct for user names in the form AA\tpmurphy
                if (user.Contains("\\"))
                {
                    user = user.Substring(3);
                }

                Ticket ticket = ticketrepo.First(c => c.Client.LanId.ToLower() == user);

                return ticket;
            }
            catch
            {
                return null;
            }
        }

        //
        // GET: /Ticket/JSON
        //throw all tickets back as json
        //used for ticket finder typeahead
        [AllowAnonymous]
        public JsonResult JSON(string id)
        {
            return Json(ticketrepo, JsonRequestBehavior.AllowGet);
        }

        //
        // GET: /Ticket/
        // GET: /Ticket/Index
        // GET: /Ticket/Index/NY
        // Going to return all passes.  If a location is specified, we filter it to that
        [AllowAnonymous]
        public ActionResult Index(string id)
        {
            ViewBag.flash = TempData["flash"];
            ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");
            ViewBag.location = id;

            //as we want to pass either the index, or a filtered index, 
            //the model is defined as @model MongoDB.Driver.Linq.MongoQueryable<parkingPass.Data.Pass>
            //rather than the more typical @model MongoRepository.MongoRepository<parkingPass.Data.Pass>
            System.Linq.IOrderedQueryable<parkingPass2.Data.Ticket> result = null;
            if (id == null)
            {
                result = ticketrepo.OrderBy(s => s.Client.DisplayName);
            }
            else
            {
                result = ticketrepo.Where(c => c.Client.Office == id).OrderBy(s => s.Client.DisplayName);
            }

            return View(result);
            //return View(passrepo);
        }

        //
        // GET: /Ticket/MyTicket
        // will return the current users pass, if it exists, otherwise will bounce them to a "you have no pass" page\
        // or maybe just send them to the welcome page with a flash that explains all
        public ActionResult MyTicket()
        {

            Ticket ticket = getMyTicket();

            if (ticket == null)
            {
                string comment = "No Pass for you has been found - if you wish a pass, please create one";
                TempData["flash"] = buildFlash("warning", "No Pass Found", comment);
                //ViewBag.flash = TempData["flash"];

                return RedirectToAction("SelfCreate");
            }
            else
            {
                bool isAdmin = isInRole(User.Identity.Name, "Admin");
                ViewBag.isAdmin = isAdmin;
                ViewBag.isMyTicket = isMyTicket(ticket);

                //we need to set to ViewBag properties to have the delete button, add plate, and remove plate buttons work
                ViewBag.id = ticket.Id;
                ViewBag.controller = RouteData.Values["controller"].ToString();

                return View("Details", ticket);
            }
            
        }

        //
        // GET: /Ticket/Details/5
        public ActionResult Details(string id)
        {
            Ticket ticket = ticketrepo.GetById(id);

            ViewBag.flash = TempData["flash"];

            ViewBag.isMyTicket = isMyTicket(ticket);

            bool isAdmin = isInRole(User.Identity.Name, "Admin");
            ViewBag.isAdmin = isAdmin;

            //ViewBag.id required for delete button, _AddPlate, and _RemovePlate
            ViewBag.id = id;

            if (isAdmin)
            {
                //ViewBag.controller = "Ticket";
                ViewBag.controller = RouteData.Values["controller"].ToString();

                //we need to set a tag color and expiration date if not already there
                //would prefer these are done in client so we don't show a tag without all info
                /*
                if (ticket.Tag == null) { 
                    //List<VehicleClass> vehicles = new List<VehicleClass>();
                    TagClass tag = new TagClass() 
                    {
                        Color = "Green", 
                        Expires = ticket.Client.ExpirationDate
                    };

                    ticket.Tag = tag;
                }
                */            }

            return View(ticket);
        }   

        //
        // GET: /Ticket/SelfCreate
        // the user is creating a ticket for themselves
        public ActionResult SelfCreate()
        {
            
            //ViewData["Office"] = new SelectList(people, "UserID", "UserName");
            //ViewBag.primaryPlate = "";

            string user = User.Identity.Name.ToLower();
            //we want to correct for user names in the form AA\tpmurphy
            if (user.Contains("\\"))
            {
                user = user.Substring(3);
            }
            ViewBag.lanid = user;

            ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");

            return View(
                new Ticket()
                {
                }
            );
        }

        //
        // POST: /Ticket/SelfCreate
        [HttpPost]
        public ActionResult SelfCreate(Ticket ticket)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    ticket.Updated = DateTime.Now;
                    ticket.Status = "Request";
                    ticket.RequestType = "Self";

                    string user = User.Identity.Name.ToLower();
                    //we want to correct for user names in the form AA\tpmurphy
                    if (user.Contains("\\"))
                    {
                        user = user.Substring(3);
                    }
                    ticket.UpdatedBy = user;

                    ticketrepo.Add(ticket);

                    string comment = User.Identity.Name + " has reqested a parking pass.  Ticket id: " + ticket.Id;
                    string alertType = "success";

                    //right here we need to send the message to the admin - if there is a template for this location
                    //success of send should feed back into log
                    //the SelfCreate should be pulled from the action

                    if (sendTemplate("Notification_SelfCreate", ticket))
                    {
                        comment = comment + ".  Email message sent.";
                    }
                    else
                    {
                        comment = comment + ".  Email message NOT sent.";
                        alertType = "warning";
                    }
                    

                    //now log it
                    bool logged = logAction(comment, "Informational");

                    TempData["flash"] = buildFlash(alertType, "Ticket Created", comment);

                    return RedirectToAction("Display", "Template", new { id = "Post_SelfCreate" });
                }
                else {
                    return View(ticket);
                }

            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Creating Pass Request");

                return View();
            }
        }

        //
        // we need to notify - send template
        public bool sendTemplate(string root_templatename, Ticket ticket)
        {
            try
            {
                //try to send message
                MailAddressCollection toCollection = new MailAddressCollection();
                MailAddressCollection ccCollection = new MailAddressCollection();
                string templatename = root_templatename;

                switch (root_templatename)
                {
                    case "Notification_SelfCreate":
                    case "Notification_TagIssued":
                    {
                        templatename = root_templatename + "_" + ticket.Client.Office;
                        break;
                    }
                }
                
                MongoRepository<Template> templaterepo = new MongoRepository<Template>();
                Template template = templaterepo.First(c => c.Key == templatename);


                //some templates may have different sendto and from rules
                string fromstr = "";
                switch (root_templatename)
                {
                    case "Notification_SelfCreate": 
                    {
                        fromstr = ticket.Client.Email;

                        foreach (eMailAddress recipient in template.SendTo)
                        {
                            toCollection.Add(new MailAddress(recipient.Address));
                        }

                        //for testing only
                        //toCollection.Add(new MailAddress("murphy.tom@epa.gov"));

                        break;
                    }
                    case "Notification_TagIssued": 
                    {
                        fromstr = template.From.Address;

                        toCollection.Add(new MailAddress(ticket.Client.Email));

                        //for testing only
                        //toCollection.Add(new MailAddress("murphy.tom@epa.gov"));

                        break;
                    }

                }

                //public bool smtpMailHelper(MailAddressCollection toCollection, MailAddressCollection ccCollection, string subject, string body, bool isHtml, MailAddress from, string priority)
                string subject = decodedTemplate(ticket, template.Subject);
                string body = decodedTemplate(ticket, template.Body);

                return smtpMailHelper(toCollection, ccCollection, subject, body, true, new MailAddress(fromstr), "Normal");
                //return true;
                
            }
            catch
            {
                return false;
            }
        }

        //
        // GET: /Ticket/AdminCreate
        // an admin is creating a ticket for someone
        public ActionResult AdminCreate()
        {
            ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");
            //ViewData["Office"] = new SelectList(people, "UserID", "UserName");
            //ViewBag.primaryPlate = "";

            return View(
                new Ticket()
                {
                }
            );
        }

        //
        // POST: /Ticket/AdminCreate
        //We probably could have leveraged the SelfCreate action above, but the workflow is likely to be different
        [HttpPost]
        public ActionResult AdminCreate(Ticket ticket)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    ticket.Updated = DateTime.Now;
                    ticket.Status = "Request";
                    ticket.RequestType = "Admin";

                    string user = User.Identity.Name.ToLower();
                    //we want to correct for user names in the form AA\tpmurphy
                    if (user.Contains("\\"))
                    {
                        user = user.Substring(3);
                    }
                    ticket.UpdatedBy = user;

                    ticketrepo.Add(ticket);

                    //now log it
                    bool logged = logAction(User.Identity.Name + " has reqested a parking pass for " + ticket.Client.DisplayName + ".  Ticket id: " + ticket.Id, "Informational");

                    TempData["flash"] = buildFlash("success", "Ticket Created", "Your request for a parking pass has been created");

                    //admin create goes back to ticket as we will likely be adding a signature and whatnot.
                    return RedirectToAction("Details", "Ticket", new { id = ticket.Id });
                }
                else
                {
                    return View(ticket);
                }

            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Creating Pass Request");

                return View();
            }
        }

        //
        // GET: /Ticket/Create
        public ActionResult Create()
        {
            return View();
        }

        //
        // POST: /Ticket/Create
        [HttpPost]
        public ActionResult Create(FormCollection collection)
        {
            try
            {
                // TODO: Add insert logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        //
        // GET: /Ticket/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        //
        // POST: /Ticket/Edit/5
        [HttpPost]
        public ActionResult Edit(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add update logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        //
        // GET: /Ticket/Delete/5
        /*
        public ActionResult Delete(int id)
        {
            return View();
        }
        */


        //
        // POST: /Ticket/Delete
        [HttpPost]
        public ActionResult Delete(string id)
        {
            try
            {
                string comment = "";
                if (isInRole(User.Identity.Name, "Admin"))
                {
                    Ticket ticket = ticketrepo.GetById(id);

                    ticketrepo.Delete(id);
                    //now log this          
                    comment = "The ticket with id of " + id + " has been deleted";
                    logAction(comment, "Informational");

                    TempData["flash"] = buildFlash("success", "Ticket Deleted", comment);

                    return RedirectToAction("Index");
                }
                else
                {
                    comment = "You have insufficient rights to delete this ticket";
                    logAction(comment, "Warning");
                    TempData["flash"] = buildFlash("warning", "Insufficient Rights", comment);

                    return RedirectToAction("Index");
                }
            }
            catch
            {
                string comment = "Error deleting ticket";
                logAction(comment, "Error");
                TempData["flash"] = buildFlash("danger", "Error", comment);

                return RedirectToAction("Index");

            }
        }

        //
        //POST: /Ticket/AddPlate/5
        // We are adding a new member to membership of this role
        [HttpPost]
        public ActionResult AddPlate(string id, VehicleClass vehicle)
        {
            try
            {
                Ticket ticket = ticketrepo.GetById(id);

                if (ticket.Vehicles == null)
                {
                    //adding first vehicle to list
                    List<VehicleClass> vehicles = new List<VehicleClass>();
                    vehicles.Add(vehicle);
                    ticket.Vehicles = vehicles;
                }
                else
                {
                    ticket.Vehicles.Add(vehicle);

                }

                ticketrepo.Update(ticket);

                string comment = vehicle.Plate + " was added to the vehicle list";
                string alertTitle = "Vehicle Added";
                string alertType = "success";

                //now log it
                logAction(comment, "Informational");

                //add flash
                TempData["flash"] = buildFlash(alertType, alertTitle, comment);

                return RedirectToAction("Details", new { id = ticket.Id });
            }
            catch
            {
                string comment = "Error adding plate to this request";

                //create flash
                TempData["flash"] = buildFlash("warning", "Add Plate Error", comment);

                //now log it
                logAction(comment, "Error");

                return RedirectToAction("Index");
            }
        }

        //
        //POST: /Ticket/RemovePlate/5
        // We are removing a plate from this ticket
        [HttpPost]
        public ActionResult RemovePlate(string id, string old_plate)
        {
            try
            {
                Ticket ticket = ticketrepo.GetById(id);

                List<VehicleClass> vehicles = ticket.Vehicles;

                string comment = "";
                string alertType = "info";

                //go ahead and remove the old member from the list
                var itemToRemove = vehicles.SingleOrDefault(r => r.Plate == old_plate);
                if (itemToRemove != null)
                {
                    vehicles.Remove(itemToRemove);
                    ticket.Vehicles = vehicles;
                    ticketrepo.Update(ticket);

                    comment = "Removed " + old_plate + " from request for " + ticket.Client.DisplayName;
                    alertType = "success";
                }
                else
                {
                    comment = old_plate + " was not found in request " + ticket.Client.DisplayName;
                    alertType = "warning";
                }

                //now log it
                logAction(comment, "Informational");

                //add flash
                TempData["flash"] = buildFlash(alertType, "Plate Removed", comment);

                //return RedirectToAction("Index");
                return RedirectToAction("Details", new { id = ticket.Id });
            }
            catch
            {
                string comment = "Error removing " + old_plate + " from request with id = " + id;

                //create flash
                TempData["flash"] = buildFlash("warning", "Remove Plate Error", comment);

                //now log it
                logAction(comment, "Error");

                return RedirectToAction("Index");
            }
        }

        //
        //POST: /Ticket/IssueTag/6
        // we are issue a tag number to someone
        [HttpPost]
        public ActionResult IssueTag(string id, TagClass tag)
        {
            try
            {
                Ticket ticket = ticketrepo.GetById(id);

                tag.Issued = DateTime.Now;

                string user = User.Identity.Name.ToLower();
                //we want to correct for user names in the form AA\tpmurphy
                if (user.Contains("\\"))
                {
                    user = user.Substring(3);
                }
                tag.IssuedBy = user;

                ticket.Tag = tag;
                ticket.Status = "Issued";

                ticketrepo.Update(ticket);

                string comment = tag.IssuedBy + " issued tag.";
                string alertTitle = "Tag Issued";
                string alertType = "success";

                //now log it
                logAction(comment, "Informational");

                //send mail to user to pick up (Notification_TagIssued_Location)
                //success of send should feed back into log
                //the TagIssued should be pulled from the action
                if (sendTemplate("Notification_TagIssued", ticket))
                {
                    comment = comment + "  Email message sent.";
                }
                else
                {
                    comment = comment + "  Email message NOT sent.";
                    alertType = "warning";
                }

                //add flash
                TempData["flash"] = buildFlash(alertType, alertTitle, comment);

                return RedirectToAction("Details", new { id = ticket.Id });
            }
            catch
            {
                string comment = "Error issuing tag";

                //create flash
                TempData["flash"] = buildFlash("danger", "Tag Issue Error", comment);

                //now log it
                logAction(comment, "Error");

                return RedirectToAction("Index");
            }
        }

        //
        //POST: /Ticket/DeleteTag/6
        // we are delete the tag from a ticket
        [HttpPost]
        public ActionResult DeleteTag(string id)
        {
            try
            {
                Ticket ticket = ticketrepo.GetById(id);

                string comment = "The " + ticket.Tag.Color + " tag number " + ticket.Tag.Number + " has been revoked";

                ticket.Tag = null;
                ticket.Status = "Revoked";

                ticketrepo.Update(ticket);

                string alertTitle = "Tag Deleted";
                string alertType = "success";

                //now log it
                logAction(comment, "Informational");

                //send mail to user to pick up (Notification_TagIssued_Location)
                //success of send should feed back into log
                //the TagIssued should be pulled from the action
                /*
                if (sendTemplate("Notification_TagRevoked", ticket))
                {
                    comment = comment + "  Email message sent.";
                }
                else
                {
                    comment = comment + "  Email message NOT sent.";
                    alertType = "warning";
                }
                 */

                //add flash
                TempData["flash"] = buildFlash(alertType, alertTitle, comment);

                return RedirectToAction("Details", new { id = ticket.Id });
            }
            catch
            {
                string comment = "Error revoking tag";

                //create flash
                TempData["flash"] = buildFlash("danger", "Tag Revoke Error", comment);

                //now log it
                logAction(comment, "Error");

                return RedirectToAction("Index");
            }
        }

        //
        //POST: /Ticket/Sign/6
        // someone with no access to lan is manually signing
        [HttpPost]
        public ActionResult Sign(string id, SignatureClass signature)
        {
            try
            {
                Ticket ticket = ticketrepo.GetById(id);

                signature.Created = DateTime.Now;
                signature.CreatedBy = User.Identity.Name;

                ticket.Signature = signature;

                ticketrepo.Update(ticket);

                string comment = ticket.Client.DisplayName + " manually signed form";
                string alertTitle = "Form Signed";
                string alertType = "success";

                //now log it
                logAction(comment, "Informational");

                //add flash
                TempData["flash"] = buildFlash(alertType, alertTitle, comment);

                return RedirectToAction("Details", new { id = ticket.Id });
            }
            catch
            {
                string comment = "Error adding signature to this request";

                //create flash
                TempData["flash"] = buildFlash("warning", "Signature Error", comment);

                //now log it
                logAction(comment, "Error");

                return RedirectToAction("Index");
            }
        }




    }
}
