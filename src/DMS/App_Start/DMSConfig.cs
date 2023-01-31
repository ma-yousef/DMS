using System;
using System.Web.Optimization;

[assembly: WebActivator.PostApplicationStartMethod(
    typeof(DMS.App_Start.DMSConfig), "PreStart")]

namespace DMS.App_Start
{
    public static class DMSConfig
    {
        public static void PreStart()
        {
            // Add your start logic here
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            //Initialize Membership
            WebMatrix.WebData.WebSecurity.InitializeDatabaseConnection("MembershipConnection", "User", "Id", "UserName", autoCreateTables: true);
        }
    }
}