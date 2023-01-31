using System.Web.Mvc;

[assembly: WebActivator.PreApplicationStartMethod(
    typeof(DMS.App_Start.DMSRouteConfig), "RegisterDMSPreStart", Order = 2)]

namespace DMS.App_Start {
  ///<summary>
  /// Inserts the HotTowel SPA sample view controller to the front of all MVC routes
  /// so that the HotTowel SPA sample becomes the default page.
  ///</summary>
  ///<remarks>
  /// This class is discovered and run during startup
  /// http://blogs.msdn.com/b/davidebb/archive/2010/10/11/light-up-your-nupacks-with-startup-code-and-webactivator.aspx
  ///</remarks>
  public static class DMSRouteConfig {

    public static void RegisterDMSPreStart() {

      // Preempt standard default MVC page routing to go to HotTowel Sample
      System.Web.Routing.RouteTable.Routes.MapRoute(
          name: "DMSDefault",
          url: "{controller}/{action}/{id}",
          defaults: new
          {
              controller = "Default",
              action = "Index",
              id = UrlParameter.Optional
          }
      );
    }
  }
}