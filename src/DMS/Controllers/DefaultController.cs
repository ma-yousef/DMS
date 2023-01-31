using System.Web.Mvc;
using System.Web.Security;
using WebMatrix.WebData;
using System.Linq;

namespace DMS.Controllers
{
    public class DefaultController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        [AllowAnonymous]
        [System.Web.Http.HttpPost]
        public JsonResult AjaxLogin(string userName, string password, bool rememberMe)
        {
            if (ModelState.IsValid)
            {
                if (WebSecurity.Login(userName, password, persistCookie: rememberMe))
                {
                    FormsAuthentication.SetAuthCookie(userName, rememberMe);
                    return Json(new { success = true, returnUrl = "/Default/Index" });
                }
                else
                {
                    ModelState.AddModelError("", "خطأ فى إسم المستخدم او كلمة السر");
                }
            }
            return Json(new { errors = ModelState.SelectMany(x => x.Value.Errors.Select(e => e.ErrorMessage)) });
        }

        [HttpPost]
        public ActionResult LogOut()
        {
            WebSecurity.Logout();

            return RedirectToAction("Index", "Default");
        }
        [HttpGet]
        public ActionResult getAllDocumentStatus()
        {

            
            return View();
        }

    }
}
