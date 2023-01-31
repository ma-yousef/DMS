using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using Microsoft.Office.Tools.Excel;
using Microsoft.Office.Interop.Excel;
using System.Reflection;
using System.IO;

namespace DMS.Helpers
{
    public class CustomMultipartFormDataStreamProvider : MultipartFormDataStreamProvider
    {

        public CustomMultipartFormDataStreamProvider(string rootPath)
            : base(rootPath)
        {
        }

        public override string GetLocalFileName(System.Net.Http.Headers.HttpContentHeaders headers)
        {
            string[] segments = headers.ContentDisposition.FileName.Split('.');
            string extenstion = String.Empty;
            if (segments.Length > 0)
                extenstion = "." + segments[segments.Length - 1].Replace("\"", String.Empty);
            //string root = HttpContext.Current.Server.MapPath("~/Attachments");
            //Application excelApplication = new Application();
            //excelApplication.ScreenUpdating = false;
            //excelApplication.DisplayAlerts = false;
            //excelApplication.Visible = false;
            //Microsoft.Office.Interop.Excel.Workbook excelWorkbook = excelApplication.Workbooks.Open(
            //Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) +
            // root + "\\" + Guid.NewGuid() + extenstion);
            //var filepath = root + @"\\" + Guid.NewGuid() + extenstion;
            //var extension1 = Path.GetExtension(filepath).ToUpper();

            //if (extension1 == ".XLS" || extension1 == ".XLSX")
            //{
            //    // is an Excel file
            //}
            //try
            //{
            //    ((Microsoft.Office.Interop.Excel._Worksheet)
            //    excelWorkbook.ActiveSheet).PageSetup.Orientation =
            //    Microsoft.Office.Interop.Excel.XlPageOrientation.xlLandscape;

            //    excelWorkbook.ExportAsFixedFormat(XlFixedFormatType.xlTypePDF,
            //    Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) +root+
            //        "\\" + Guid.NewGuid() + "pdf");
            //}
            //catch (Exception e)
            //{
            //    Console.WriteLine(e.Message);
            //    Console.ReadLine();
            //}
            return Guid.NewGuid() + extenstion;
        }
    }
}