using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Configuration;
using MongoRepository;
using parkingPass2.Data;
using parkingPass2.Rabbit;

namespace parkingPass2.Controllers
{
    public class TemplateController : BaseController
    {
        static MongoRepository<Template> templaterepo = new MongoRepository<Template>();

        //
        // GET: /Template]/AsJSON/7
        // given an id, 
        /*will return dates using Microsoft JSON date format, but we can control this with
         var json = GlobalConfiguration.Configuration.Formatters.JsonFormatter;
        json.SerializerSettings.DateFormatHandling  = Newtonsoft.Json.DateFormatHandling.MicrosoftDateFormat;
         * 
        */
        [AllowAnonymous]
        public JsonResult AsJSON(string id)
        {
            var template = templaterepo.GetById(id);

            return Json(template, JsonRequestBehavior.AllowGet);
        }

        //
        // GET: /Template/ByKeyAsJSON/Contact
        // given a key, will return document as json
        [AllowAnonymous]
        public JsonResult ByKeyAsJSON(string id)
        {
            try
            {
                var template = templaterepo.First(c => c.Key == id);
                return Json(template, JsonRequestBehavior.AllowGet);
            }
            catch
            {
                //is there a better thing to pass back.  Perhaps json {"error": "no template found"} or some such
                return Json(null, JsonRequestBehavior.AllowGet);
            }
        }

        //
        // GET: /Template/
        [AllowAnonymous]
        public ActionResult Index()
        {
            //ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");
            ViewBag.flash = TempData["flash"];
            ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");
            return View(templaterepo);
        }

        //
        //GET: /Template/Create
        public ActionResult Create()
        {
            return View(
                new Template() { }

            );
        }

        //
        // POST: /Template/Create
        // Would have prefered using [AllowHTML] on just the body, rather than disabling validation for this action
        // but as this action is an admin only action, we should be OK
        [ValidateInput(false)]
        [HttpPost]
        public ActionResult Create(Template template)
        {
            try
            {

                templaterepo.Add(template);

                //now log it
                bool logged = logAction("Created Template " + template.Key, "Informational");

                TempData["flash"] = buildFlash("success", "Template Created", "Template has been created");

                return RedirectToAction("Index");
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Creating Template");

                return View();
            }
        }


        //
        // GET: /Template/Details/5
        [AllowAnonymous]
        public ActionResult Details(string id)
        {
            Template template = templaterepo.GetById(id);

            ViewBag.flash = TempData["flash"];

            bool isAdmin = isInRole(User.Identity.Name, "Admin");
            ViewBag.isAdmin = isAdmin;

            if (isAdmin)
            {
                //we need to set to ViewBag properties to have the delete button work
                ViewBag.id = id;
                //ViewBag.controller = "Template";
                ViewBag.controller = RouteData.Values["controller"].ToString();
            }

            return View(template);
        }

        //
        // GET: /Template/Display/Welcome
        // similar to read, but getting by key, and displaying in a slightly different way
        [AllowAnonymous]
        public ActionResult Display(string id)
        {
            Template template = null;

            ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");

            if (templaterepo.Exists(c => c.Key == id))
            {
                template = templaterepo.First(c => c.Key == id);

                ViewBag.flash = TempData["flash"];
            }
            else
            {
                template = new Template()
                {
                    Subject = id,
                    Key = id,
                    Body = "The page for this key does not yet exist"
                };

                ViewBag.flash = buildFlash("warning", "Page does not exist", "A page for this key does not yet exist.  Please contact your admin.");
            }

            return View(template);
        }


        //
        //GET: /Template/Edit/id
        public ActionResult Edit(string id)
        {
            Template template = templaterepo.GetById(id);

            return View(template);
        }

        //
        // POST: /Template/Edit
        // Would have prefered using [AllowHTML] on just the body, rather than disabling validation for this action
        // but as this action is an admin only action, we should be OK
        [ValidateInput(false)]
        [HttpPost]
        public ActionResult Edit(Template template)
        {
            try
            {
                templaterepo.Update(template);

                //now log it
                bool logged = logAction("Updated Template " + template.Key, "Informational");

                TempData["flash"] = buildFlash("success", "Template Updated", "Template has been updated");

                return RedirectToAction("Index");
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Updating Template");

                return View();
            }
        }


        //
        //POST: /Template/AddSendTo/5
        // We are adding a new member to the sendto list
        [HttpPost]
        public ActionResult AddSendTo(string id, eMailAddress emailAddress)
        {
            try
            {
                Template template = templaterepo.GetById(id);

                if (template.SendTo == null)
                {
                    //adding first vehicle to list
                    List<eMailAddress> sendTo = new List<eMailAddress>();
                    sendTo.Add(emailAddress);
                    template.SendTo = sendTo;
                }
                else
                {
                    template.SendTo.Add(emailAddress);

                }

                templaterepo.Update(template);

                string comment = emailAddress.DisplayName + " was added to the sendTo list";
                string alertTitle = "SendTo Added";
                string alertType = "success";

                //now log it
                logAction(comment, "Informational");

                //add flash
                TempData["flash"] = buildFlash(alertType, alertTitle, comment);

                return RedirectToAction("Details", new { id = template.Id });
            }
            catch
            {
                string comment = "Error adding sendto to this request";

                //create flash
                TempData["flash"] = buildFlash("warning", "Add SendTo Error", comment);

                //now log it
                logAction(comment, "Error");

                return RedirectToAction("Index");
            }
        }

        //
        //POST: /Template/RemoveSendTo/5
        // We are removing a sendTo from this ticket
        [HttpPost]
        public ActionResult RemoveSendTo(string id, string old_sendto_address)
        {
            try
            {
                Template template = templaterepo.GetById(id);

                List<eMailAddress> sendtolist = template.SendTo;

                string comment = "";
                string alertType = "info";

                //go ahead and remove the old member from the list
                var itemToRemove = sendtolist.SingleOrDefault(r => r.Address == old_sendto_address);
                if (itemToRemove != null)
                {
                    sendtolist.Remove(itemToRemove);
                    template.SendTo = sendtolist;
                    templaterepo.Update(template);

                    comment = "Removed " + old_sendto_address + " from send to list";
                    alertType = "success";
                }
                else
                {
                    comment = old_sendto_address + " was not found in sendto list ";
                    alertType = "warning";
                }

                //now log it
                logAction(comment, "Informational");

                //add flash
                TempData["flash"] = buildFlash(alertType, "SendTo Removed", comment);

                //return RedirectToAction("Index");
                return RedirectToAction("Details", new { id = template.Id });
            }
            catch
            {
                string comment = "Error removing " + old_sendto_address + " from request with id = " + id;

                //create flash
                TempData["flash"] = buildFlash("warning", "Remove SendTo Error", comment);

                //now log it
                logAction(comment, "Error");

                return RedirectToAction("Index");
            }
        }




        //
        // GET: /test/Delete/5
        // public ActionResult Delete(string id)
        // {
        //     return View();
        // }

        //
        // POST: /Template/Delete
        [HttpPost]
        public ActionResult Delete(string id)
        {
            try
            {
                string comment = "";
                if (isInRole(User.Identity.Name, "Admin"))
                {
                    Template template = templaterepo.GetById(id);
                    string title = template.Key;

                    templaterepo.Delete(id);
                    //now log this          
                    comment = "The " + title + " template has been deleted";
                    logAction(comment, "Informational");

                    TempData["flash"] = buildFlash("success", "Template Deleted", comment);

                    return RedirectToAction("Index");
                }
                else
                {
                    comment = "You have insufficient rights to delete this template";
                    logAction(comment, "Warning");
                    TempData["flash"] = buildFlash("warning", "Insufficient Rights", comment);

                    return RedirectToAction("Index");
                }
            }
            catch
            {
                string comment = "Error deleting template";
                logAction(comment, "Error");
                TempData["flash"] = buildFlash("danger", "Error", comment);

                return RedirectToAction("Index");

            }
        }

    }
}