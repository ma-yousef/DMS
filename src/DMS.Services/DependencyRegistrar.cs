using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Autofac;
using Autofac.Builder;
using Autofac.Core;
using Autofac.Integration.Mvc;
using Breeze.WebApi;
using Breeze.WebApi.EF;

namespace DMS.Services
{
    public class DependencyRegistrar
    {
        public static void Register(ContainerBuilder builder)
        {
            builder.Register<EFContextProvider<DMSEntities>>(c => new EFContextProvider<DMSEntities>()).InstancePerHttpRequest();
            builder.Register<DbContext>(c => c.Resolve<EFContextProvider<DMSEntities>>().Context).InstancePerHttpRequest();
            builder.RegisterGeneric(typeof(EfRepository<>)).As(typeof(IRepository<>)).InstancePerHttpRequest();

            var assembly = Assembly.GetExecutingAssembly();

            builder.RegisterAssemblyTypes(assembly)
                .Where(t => t.Name.EndsWith("UnitOfWork")).AsImplementedInterfaces().InstancePerHttpRequest();

            builder.RegisterAssemblyTypes(assembly)
                .Where(t => t.Name.EndsWith("Repository")).AsImplementedInterfaces().InstancePerHttpRequest();
        }
    }
}
