using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net.Mail;
using MongoRepository;
using parkingPass2.Data;
using parkingPass2.Rabbit;

namespace parkingPass2.Controllers
{
    public class LogController : BaseController
    {

        static MongoRepository<Log> logrepo = new MongoRepository<Log>();

        //
        // GET: /Log/JSON/5
        //given an Id, will return all logs that match that id
        [AllowAnonymous]
        public JsonResult JSON(string id)
        {
            var result = logrepo.Where(c => c.RefId == id);
            return Json(result, JsonRequestBehavior.AllowGet);
        }
	}
}