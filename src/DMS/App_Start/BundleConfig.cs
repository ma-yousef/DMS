using System;
using System.Web.Optimization;

namespace DMS
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.IgnoreList.Clear();
            AddDefaultIgnorePatterns(bundles.IgnoreList);

            bundles.Add(
              new ScriptBundle("~/scripts/head")
              .Include("~/scripts/jquery-{version}.min.js")
              .Include("~/scripts/jquery.calendars.min.js")
              .Include("~/scripts/jquery.calendars.plus.min.js")
            );

            bundles.Add(
              new ScriptBundle("~/scripts/vendor")
                .Include("~/scripts/jquery.blockui.js")
                .Include("~/scripts/jquery.form.js")
                .Include("~/scripts/knockout-2.2.1.js")
                .Include("~/scripts/knockout.validation.min.js")
                .Include("~/scripts/sammy-{version}.min.js")
                .Include("~/scripts/toastr.min.js")
                 .Include("~/scripts/es5-shim.min.js")
                .Include("~/scripts/Q.min.js")
                .Include("~/scripts/breeze.min.js")
                .Include("~/scripts/breeze.savequeuing.js")
                .Include("~/scripts/bootstrap.min.js")
                .Include("~/scripts/moment.min.js")
                .Include("~/scripts/string.js")
                .Include("~/scripts/jquery.pnotify.min.js")
                .Include("~/scripts/excelconvert.js")
                .Include("~/scripts/hijricalendar.js")
                .Include("~/scripts/jquery.calendars-ar-EG.js")
                .Include("~/scripts/jquery.calendars.picker.min.js")
                .Include("~/scripts/jquery.calendars.picker-ar.js")
                .Include("~/scripts/jquery.calendars.islamic.min.js")
                .Include("~/scripts/jquery.calendars.islamic-ar.js")
                .Include("~/scripts/helper.js")
                .Include("~/scripts/jquery.flot.js")
                .Include("~/scripts/jquery.flot.pie.js")
                .Include("~/scripts/jquery.flot.orderBars.js")
                .Include("~/scripts/jquery.flot.tickrotor.js")
                .Include("~/scripts/jquery.btechco.excelexport.min.js")
                .Include("~/scripts/jquery.base64.js")
              );

            bundles.Add(
              new StyleBundle("~/Content/css")
                .Include("~/Content/ie10mobile.css")
                .Include("~/Content/bootstrap-rtl.min.css")
                .Include("~/Content/bootstrap-responsive-rtl.min.css")
                //.Include("~/Content/bootstrap.min.css")
                //.Include("~/Content/bootstrap-responsive.min.css")
                .Include("~/Content/rtl.css")
                .Include("~/Content/bootstrap.icon-large.min.css")
                .Include("~/Content/durandal.css")
                .Include("~/Content/toastr.min.css")
                .Include("~/Content/app.css")
                .Include("~/Content/jquery.pnotify.default.css")
                .Include("~/Content/jquery.pnotify.default.icons.css")
                .Include("~/Content/jquery.calendars.picker.css")
                //.Include("~/Content/examples.css")
                //.Include("~/Content/datepicker.less")
                //.Include("~/Content/datepicker.css")
              );

            bundles.Add(new ScriptBundle("~/App/ajaxlogin")
             .Include("~/Scripts/jquery.blockui.js")
             .Include("~/App/ajaxlogin.js"));
        }

        public static void AddDefaultIgnorePatterns(IgnoreList ignoreList)
        {
            if (ignoreList == null)
            {
                throw new ArgumentNullException("ignoreList");
            }

            ignoreList.Ignore("*.intellisense.js");
            ignoreList.Ignore("*-vsdoc.js");

            //ignoreList.Ignore("*.debug.js", OptimizationMode.WhenEnabled);
            //ignoreList.Ignore("*.min.js", OptimizationMode.WhenDisabled);
            //ignoreList.Ignore("*.min.css", OptimizationMode.WhenDisabled);
        }
    }
}