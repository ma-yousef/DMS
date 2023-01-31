using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Breeze.WebApi;

namespace DMS.Services
{
    public interface IUnitOfWork
    {
        string Metadata();
        SaveResult Commit(Newtonsoft.Json.Linq.JObject saveBundle);
    }
}
