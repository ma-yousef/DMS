﻿<%@ Register Assembly="Microsoft.ReportViewer.WebForms, Version=10.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a" Namespace="Microsoft.Reporting.WebForms" TagPrefix="rsweb" %>
<!DOCTYPE html>
<script runat="server">

    Protected Sub DMSDataSet_ObjectCreating(sender As Object, e As ObjectDataSourceEventArgs)
        e.ObjectInstance = New DMS.Services.Documents.DocumentListRepository(New DMS.Services.DMSEntities())
        
    End Sub
</script>

<html>
<head runat="server">
    <title>View Report</title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
    
        <asp:ScriptManager ID="ScriptManager1" runat="server">
        </asp:ScriptManager>
    
    </div>
        <rsweb:ReportViewer ID="ReportViewer1" runat="server" Width="100%" 
            Font-Names="Verdana" Font-Size="8pt" InteractiveDeviceInfos="(Collection)" 
            WaitMessageFont-Names="Verdana" WaitMessageFont-Size="14pt" 
            SizeToReportContent="True" AsyncRendering="False">
            <LocalReport ReportPath="reports\Report1.rdlc">
                <DataSources>
                    <rsweb:ReportDataSource DataSourceId="DMSDataSet" Name="DataSet2" />
                </DataSources>
            </LocalReport>
         
            
        </rsweb:ReportViewer>
        <asp:ObjectDataSource ID="DMSDataSet" runat="server" SelectMethod="getAllDocumentReport"
            TypeName="DMS.Services.Documents.DocumentListRepository" OnObjectCreating="DMSDataSet_ObjectCreating">
            
    </asp:ObjectDataSource>
        </form>
</body>
</html>
