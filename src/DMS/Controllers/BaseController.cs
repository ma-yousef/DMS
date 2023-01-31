using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Breeze.WebApi;
using DMS.Services;
using Newtonsoft.Json.Linq;

namespace DMS.Controllers
{
    [Breeze.WebApi.BreezeController]
    public abstract class BaseController : ApiController
    {
        private readonly IUnitOfWork _unitOfWork;

        public BaseController(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;
        }

        [System.Web.Http.HttpGet]
        public string Metadata()
        {
            return this._unitOfWork.Metadata();
        }

        [System.Web.Http.HttpPost]
        public virtual SaveResult SaveChanges(JObject saveBundle)
        {
            return this._unitOfWork.Commit(saveBundle);
        }
    }
}
