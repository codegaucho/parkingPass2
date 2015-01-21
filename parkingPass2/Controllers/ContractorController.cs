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
    public class ContractorController : BaseController
    {
        static MongoRepository<Contractor> contractorrepo = new MongoRepository<Contractor>();

        //
        // GET: /Contractor]/AsJSON/7
        // given an id, 
        /*will return dates using Microsoft JSON date format, but we can control this with
         var json = GlobalConfiguration.Configuration.Formatters.JsonFormatter;
        json.SerializerSettings.DateFormatHandling  = Newtonsoft.Json.DateFormatHandling.MicrosoftDateFormat;
         * 
        */
        [AllowAnonymous]
        public JsonResult AsJSON(string id)
        {
            var contractor = contractorrepo.GetById(id);

            return Json(contractor, JsonRequestBehavior.AllowGet);
        }

        //
        // GET: /Contractor/
        [AllowAnonymous]
        public ActionResult Index()
        {
            //ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");
            ViewBag.flash = TempData["flash"];
            ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");
            return View(contractorrepo);
        }

        //
        //GET: /Contractor/Create/8 
        public ActionResult Create(string id)
        {
            return View(
                new Contractor() { 
                    ContractId = id
                }

            );
        }

        //
        // POST: /Contractor/Create
        // Would have prefered using [AllowHTML] on just the body, rather than disabling validation for this action
        // but as this action is an admin only action, we should be OK
        [ValidateInput(false)]
        [HttpPost]
        public ActionResult Create(Contractor contractor)
        {
            try
            {

                contractorrepo.Add(contractor);

                //now log it
                bool logged = logAction("Created Contractor " + contractor.DisplayName, "Informational");

                TempData["flash"] = buildFlash("success", "Contractor Created", "Contractor has been created");

                return RedirectToAction("Index");
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Creating Contractor");

                return View();
            }
        }


        //
        // GET: /Contractor/Details/5
        [AllowAnonymous]
        public ActionResult Details(string id)
        {
            Contractor contractor = contractorrepo.GetById(id);

            ViewBag.flash = TempData["flash"];

            bool isAdmin = isInRole(User.Identity.Name, "Admin");
            ViewBag.isAdmin = isAdmin;

            if (isAdmin)
            {
                //we need to set to ViewBag properties to have the delete button work
                ViewBag.id = id;
                //ViewBag.controller = "Contractor";
                ViewBag.controller = RouteData.Values["controller"].ToString();
            }

            return View(contractor);
        }



        //
        //GET: /Contractor/Edit/id
        public ActionResult Edit(string id)
        {
            Contractor contractor = contractorrepo.GetById(id);

            return View(contractor);
        }

        //
        // POST: /Contractor/Edit
        // Would have prefered using [AllowHTML] on just the body, rather than disabling validation for this action
        // but as this action is an admin only action, we should be OK
        [ValidateInput(false)]
        [HttpPost]
        public ActionResult Edit(Contractor contractor)
        {
            try
            {
                contractorrepo.Update(contractor);

                //now log it
                bool logged = logAction("Updated Contractor " + contractor.DisplayName, "Informational");

                TempData["flash"] = buildFlash("success", "Contractor Updated", "Contractor has been updated");

                return RedirectToAction("Index");
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Updating Contractor");

                return View();
            }
        }





        //
        // GET: /test/Delete/5
        // public ActionResult Delete(string id)
        // {
        //     return View();
        // }

        //
        // POST: /Contractor/Delete
        [HttpPost]
        public ActionResult Delete(string id)
        {
            try
            {
                string comment = "";
                if (isInRole(User.Identity.Name, "Admin"))
                {
                    Contractor contractor = contractorrepo.GetById(id);
                    string title = contractor.DisplayName;

                    contractorrepo.Delete(id);
                    //now log this          
                    comment = "The " + title + " contractor has been deleted";
                    logAction(comment, "Informational");

                    TempData["flash"] = buildFlash("success", "Contractor Deleted", comment);

                    return RedirectToAction("Index");
                }
                else
                {
                    comment = "You have insufficient rights to delete this contractor";
                    logAction(comment, "Warning");
                    TempData["flash"] = buildFlash("warning", "Insufficient Rights", comment);

                    return RedirectToAction("Index");
                }
            }
            catch
            {
                string comment = "Error deleting contractor";
                logAction(comment, "Error");
                TempData["flash"] = buildFlash("danger", "Error", comment);

                return RedirectToAction("Index");

            }
        }

    }
}