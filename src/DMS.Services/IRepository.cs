using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Breeze.WebApi;

namespace DMS.Services
{
    public interface IRepository<T> where T : class, IEntity
    {
        IQueryable<T> All();
        IQueryable<T> All(string[] include);
    }
}