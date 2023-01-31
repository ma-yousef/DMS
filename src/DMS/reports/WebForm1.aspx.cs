using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace DMS.reports
{
    public partial class WebForm1 : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            string ReportName = Request.QueryString["ReportName"];
            if (ReportName == "Report1")
            {
                ReportViewer1.LocalReport.ReportPath = @"reports\" + ReportName + ".rdlc";
                //ReportViewer1.LocalReport.DataSources.Clear();
                ReportViewer1.LocalReport.Refresh();
            }
        }

    protected void DMSDataSet_ObjectCreating(object sender, ObjectDataSourceEventArgs e){
        e.ObjectInstance = new  DMS.Services.Documents.DocumentListRepository(new DMS.Services.DMSEntities());
    }
    }
}