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
    public class ContractController : BaseController
    {
        static MongoRepository<Contract> contractrepo = new MongoRepository<Contract>();

        //
        // GET: /Contract]/AsJSON/7
        // given an id, 
        /*will return dates using Microsoft JSON date format, but we can control this with
         var json = GlobalConfiguration.Configuration.Formatters.JsonFormatter;
        json.SerializerSettings.DateFormatHandling  = Newtonsoft.Json.DateFormatHandling.MicrosoftDateFormat;
         * 
        */
        [AllowAnonymous]
        public JsonResult AsJSON(string id)
        {
            var contract = contractrepo.GetById(id);

            return Json(contract, JsonRequestBehavior.AllowGet);
        }

        //
        // GET: /Contract/
        [AllowAnonymous]
        public ActionResult Index()
        {
            //ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");
            ViewBag.flash = TempData["flash"];
            ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");
            return View(contractrepo);
        }

        //
        //GET: /Contract/Create
        public ActionResult Create()
        {
            return View(
                new Contract() { }

            );
        }

        //
        // POST: /Contract/Create
        // Would have prefered using [AllowHTML] on just the body, rather than disabling validation for this action
        // but as this action is an admin only action, we should be OK
        [ValidateInput(false)]
        [HttpPost]
        public ActionResult Create(Contract contract)
        {
            try
            {

                contractrepo.Add(contract);

                //now log it
                bool logged = logAction("Created Contract " + contract.DisplayName, "Informational");

                TempData["flash"] = buildFlash("success", "Contract Created", "Contract has been created");

                return RedirectToAction("Index");
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Creating Contract");

                return View();
            }
        }


        //
        // GET: /Contract/Details/5
        [AllowAnonymous]
        public ActionResult Details(string id)
        {
            Contract contract = contractrepo.GetById(id);

            ViewBag.flash = TempData["flash"];

            bool isAdmin = isInRole(User.Identity.Name, "Admin");
            ViewBag.isAdmin = isAdmin;

            if (isAdmin)
            {
                //we need to set to ViewBag properties to have the delete button work
                ViewBag.id = id;
                //ViewBag.controller = "Contract";
                ViewBag.controller = RouteData.Values["controller"].ToString();
            }

            return View(contract);
        }

        

        //
        //GET: /Contract/Edit/id
        public ActionResult Edit(string id)
        {
            Contract contract = contractrepo.GetById(id);

            return View(contract);
        }

        //
        // POST: /Contract/Edit
        // Would have prefered using [AllowHTML] on just the body, rather than disabling validation for this action
        // but as this action is an admin only action, we should be OK
        [ValidateInput(false)]
        [HttpPost]
        public ActionResult Edit(Contract contract)
        {
            try
            {
                contractrepo.Update(contract);

                //now log it
                bool logged = logAction("Updated Contract " + contract.DisplayName, "Informational");

                TempData["flash"] = buildFlash("success", "Contract Updated", "Contract has been updated");

                return RedirectToAction("Index");
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Updating Contract");

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
        // POST: /Contract/Delete
        [HttpPost]
        public ActionResult Delete(string id)
        {
            try
            {
                string comment = "";
                if (isInRole(User.Identity.Name, "Admin"))
                {
                    Contract contract = contractrepo.GetById(id);
                    string title = contract.DisplayName;

                    contractrepo.Delete(id);
                    //now log this          
                    comment = "The " + title + " contract has been deleted";
                    logAction(comment, "Informational");

                    TempData["flash"] = buildFlash("success", "Contract Deleted", comment);

                    return RedirectToAction("Index");
                }
                else
                {
                    comment = "You have insufficient rights to delete this contract";
                    logAction(comment, "Warning");
                    TempData["flash"] = buildFlash("warning", "Insufficient Rights", comment);

                    return RedirectToAction("Index");
                }
            }
            catch
            {
                string comment = "Error deleting contract";
                logAction(comment, "Error");
                TempData["flash"] = buildFlash("danger", "Error", comment);

                return RedirectToAction("Index");

            }
        }

    }
}