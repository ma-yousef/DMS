using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Breeze.WebApi;
using Breeze.WebApi.EF;

namespace DMS.Services
{
    class EfRepositoryReport<T> : IRepository<T> where T : class, IEntity
    {
        protected DbContext _context;
        public EfRepositoryReport()
        {
            
        }

        public virtual IQueryable<T> All()
        {
            return this._context.Set<T>();
        }

        public virtual IQueryable<T> All(string[] include)
        {
            System.Data.Entity.Infrastructure.DbQuery<T> result = this._context.Set<T>();

            if (include != null && include.Length > 0)
            {
                foreach (string s in include)
                    result = result.Include(s);
            }

            return result;
        }
    }
}
