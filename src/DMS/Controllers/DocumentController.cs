using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using DMS.Helpers;
using DMS.Services;
using DMS.Services.Documents;
using WebMatrix.WebData;
using Microsoft.Office.Tools.Excel;
using Microsoft.Office.Interop.Excel;
using System.Reflection;
namespace DMS.Controllers
{
    public class DocumentController : BaseController
    {
        private readonly IDocumentUnitOfWork _unitOfWork;

        public DocumentController(IDocumentUnitOfWork unitOfWork)
            : base(unitOfWork)
        {
            this._unitOfWork = unitOfWork;

        }

        [HttpGet]
        public IQueryable<Document> Documents()
        {
            return this._unitOfWork.DocumentRepository.All();
        }
        [HttpGet]
        public IQueryable<ProcedureStatus> ProceduresStatus() {
            return this._unitOfWork.ProcedureStatusRepository.All();
        }
        [HttpGet]
        public IQueryable<DocumentProcedure> DocumentProcedures() {

            return this._unitOfWork.DocumentProcedureRepository.All();
        }
        
        [HttpGet]
        public IQueryable<object> DocumentList()
        {
            return this._unitOfWork.DocumentListRepository.All(WebSecurity.CurrentUserId);
        }
        [HttpGet]
        public IQueryable<RelatedPerson> RelatedPersons()
        {
            return this._unitOfWork.RelatedPersonRepository.All();
        }
        [HttpGet]
        public IQueryable<Nationality> Nationalitys()
        {
            return this._unitOfWork.NationalityRepository.All();
        }
        [HttpGet]
        public IQueryable<Attachment> Attachments()
        {
            return this._unitOfWork.AttachmentRepository.All();
        }
        [HttpGet]
        public IQueryable<AttachmentType> AttachmentTypes()
        {
            return this._unitOfWork.AttachmentTypeRepository.All();
        }

        [HttpGet]
        public IQueryable<Department> Departments()
        {
            return this._unitOfWork.DepartmentRepository.All();
        }

        [HttpGet]
        public IQueryable<Registry> Registries()
        {
            return this._unitOfWork.RegistryRepository.All();
        }
        [HttpGet]
        public IQueryable<DirectionType> DirectionTypes()
        {
            return this._unitOfWork.DirectionTypeRepository.All();
        }
        [HttpGet]
        public IQueryable<DocumentHistory> DocumentHistory()
        {
            return this._unitOfWork.DocumentHistoryRepository.All();
        }

        [HttpGet]
        public IQueryable<SecurityLevel> SecurityLevels()
        {
            return this._unitOfWork.SecurityLevelRepository.All();
        }
        [HttpGet]
        public IQueryable<Issue> Issues()
        {
            return this._unitOfWork.IssueRepository.All();
        }

        [HttpGet]
        public IQueryable<SentDocument> SentDocuments()
        {
            return this._unitOfWork.SentDocumentRepository.All();
        }
        [HttpGet]
        public IQueryable<object> SentDocumentList()
        {
            return this._unitOfWork.DocumentListRepository.GetAllSentDocuments(WebSecurity.CurrentUserId);
        }
        [HttpGet]
        public IQueryable<DocumentType> DocumentTypes()
        {
            return this._unitOfWork.DocumentTypeRepository.All();
        }

        [HttpGet]
        public IQueryable<ImportanceLevel> ImportanceLevels()
        {
            return this._unitOfWork.ImportanceLevelRepository.All();
        }

        [HttpGet]
        public IQueryable<NotificationType> NotificationTypes()
        {
            return this._unitOfWork.NotificationTypeRepository.All();
        }

        [HttpGet]
        public IQueryable<Notification> Notifications()
        {
            return this._unitOfWork.NotificationRepository.All();
        }

        [HttpGet]
        public IQueryable<ReadOnlyDepartment> ReadOnlyDepartments()
        {
            return this._unitOfWork.ReadOnlyDepartmentRepository.All();
        }

        [HttpGet]
        public IQueryable<ReadOnlyUser> ReadOnlyUsers()
        {
            return this._unitOfWork.ReadOnlyUserRepository.All();
        }

        [HttpGet]
        public IQueryable<Document> ReadOnlyDocuments()
        {
            return this._unitOfWork.DocumentListRepository.GetReadOnlyDocuments(WebSecurity.CurrentUserId);
        }

        [HttpGet]
        public IQueryable<Document> PopularizationDocuments()
        {
            return this._unitOfWork.DocumentListRepository.GetPopularizationDocuments(WebSecurity.CurrentUserId);
        }
        [HttpGet]
        public object getDocumentStatusCount()
        {
            return this._unitOfWork.DocumentListRepository.getAllDocumentStatus();
        }
        


        public async Task<HttpResponseMessage> UploadFiles()
        {
            // Check if the request contains multipart/form-data.
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            
            string root = HttpContext.Current.Server.MapPath("~/Attachments");
            var provider = new CustomMultipartFormDataStreamProvider(root);
            try
            {
                // Read the form data.
                await Request.Content.ReadAsMultipartAsync(provider);

                // This illustrates how to get the file names.
                //foreach (MultipartFileData file in provider.FileData)
                //{
                //    //Trace.WriteLine(file.Headers.ContentDisposition.FileName);
                //    //Trace.WriteLine("Server file path: " + file.LocalFileName);
                //}
                string[] segments = provider.FileData[0].LocalFileName.Split('\\');
                return Request.CreateResponse(HttpStatusCode.OK, segments[segments.Length-1]);

                //return new HttpResponseMessage()
                //{
                //    Content = new StringContent("File uploaded.")
                //};

            }
            catch (System.Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            }
            
            }
        

        // ~/api/document/Lookups
        [HttpGet]
        public object Lookups()
        {
            return new
            {
                Roles = this._unitOfWork.RoleRepository.All(),
                DocumentTypes = this._unitOfWork.DocumentTypeRepository.All(),
                DocumentStatus = this._unitOfWork.DocumentStatus.All(),
                DocumentStatusReason = this._unitOfWork.DocumentStatusReason.All(),
                SecurityLevels = this._unitOfWork.SecurityLevelRepository.All(),
                ImportanceLevels = this._unitOfWork.ImportanceLevelRepository.All(),
                AttachmentTypes = this._unitOfWork.AttachmentTypeRepository.All(),
                Nationalities = this._unitOfWork.NationalityRepository.All(),
                NotificationTypes = this._unitOfWork.NotificationTypeRepository.All()
            };
        }

    }
}

