using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MongoRepository;
using parkingPass2.Data;

namespace parkingPass2.Controllers
{
    public class HomeController : BaseController
    {
        public ActionResult Index()
        {

            MongoRepository<Template> templaterepo = new MongoRepository<Template>();
            //how do we test if we have a connection to the database
            if (1 == 2)
            {
                //return RedirectToAction("DatabaseNotFound");
            }
            else
            {
                Template template = null;
                string key = "Welcome";

                ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");


                if (templaterepo.Exists(c => c.Key == key))
                {
                    template = templaterepo.First(c => c.Key == key);
                }
                else
                {
                    template = new Template()
                    {
                        Subject = "Welcome",
                        Body = "A custom Welcome page has not been created for this <strong>application</strong> - you can create one under Admin - Templates"
                    };
                }
                return View(template);
            }
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your app description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Using()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        //
        //this isn't baked yet
        public ActionResult DatabaseNotFound()
        {
            //string action, string controller, string id, string comment
            string severity = "Critical";
            string comment = "Databaes Not Found";

            string title = "";
            string content = "Database Not Found:  We were unable to find a connection to a suitable database.  Please contact your administrator and report this message.";

            Template template = new Template()
            {
                Subject = title,
                Body = content
            };

            //give flash
            ViewBag.flash = buildFlash("danger", title, content);

            //now log it
            //would be nice to have been given the original controller and id, and the rest, but...
            bool logged = logAction(comment, severity);

            return View("../Home/Index", template);
        }
	}
}