using System.Reflection;
using System.Web.Http;
using System.Web.Mvc;
using Autofac;
using Autofac.Integration.Mvc;
using Autofac.Integration.WebApi;
using DMS.Services;

[assembly: WebActivator.PreApplicationStartMethod(
    typeof(DMS.App_Start.BreezeWebApiConfig), "RegisterBreezePreStart")]
namespace DMS.App_Start
{
    ///<summary>
    /// Inserts the Breeze Web API controller route at the front of all Web API routes
    ///</summary>
    ///<remarks>
    /// This class is discovered and run during startup; see
    /// http://blogs.msdn.com/b/davidebb/archive/2010/10/11/light-up-your-nupacks-with-startup-code-and-webactivator.aspx
    ///</remarks>
    public static class BreezeWebApiConfig
    {

        public static void RegisterBreezePreStart()
        {

            GlobalConfiguration.Configuration.Routes.MapHttpRoute(
             name: "DefaultApi",
             routeTemplate: "api/{action}",
             defaults: new { Controller = "Document" }
         );

            GlobalConfiguration.Configuration.Routes.MapHttpRoute(
                name: "BreezeApi",
                routeTemplate: "api/{controller}/{action}"
            );

            initializeAutofac(GlobalConfiguration.Configuration);
        }

        public static void initializeAutofac(HttpConfiguration config)
        {
            var builder = new ContainerBuilder();
            DependencyRegistrar.Register(builder);
            builder.RegisterControllers(Assembly.GetExecutingAssembly());
            builder.RegisterApiControllers(Assembly.GetExecutingAssembly());

            var container = builder.Build();
            DependencyResolver.SetResolver(new AutofacDependencyResolver(container));

            var resolver = new AutofacWebApiDependencyResolver(container);
            config.DependencyResolver = resolver;
        }
    }
}