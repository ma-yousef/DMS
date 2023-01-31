using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Breeze.WebApi;
using Breeze.WebApi.EF;

namespace DMS.Services
{
    public abstract class UnitOfWork : IUnitOfWork
    {
        private readonly EFContextProvider<DMSEntities> _contextProvider;

        public UnitOfWork(EFContextProvider<DMSEntities> contextProvider)
        {
            this._contextProvider = contextProvider;
            this._contextProvider.BeforeSaveEntityDelegate = BeforeSaveEntity;
            this._contextProvider.AfterSaveEntitiesDelegate = AfterSaveEntities;
        }

        public string Metadata()
        {
            return this._contextProvider.Metadata();
        }

        public Breeze.WebApi.SaveResult Commit(Newtonsoft.Json.Linq.JObject saveBundle)
        {
            return _contextProvider.SaveChanges(saveBundle);
        }

        protected virtual bool BeforeSaveEntity(EntityInfo entityInfo)
        {
            return true;
        }

        protected virtual void AfterSaveEntities(Dictionary<Type, List<EntityInfo>> saveMap, List<KeyMapping> keyMappings)
        { 
        }
    }
}
