using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Breeze.WebApi;
using Breeze.WebApi.EF;

namespace DMS.Services.Documents
{
    public class DocumentUnitOfWork : UnitOfWork, IDocumentUnitOfWork
    {

        public DocumentUnitOfWork(EFContextProvider<DMSEntities> contextProvider,
            IRepository<Document> documentRepository,
            IDocumentListRepository documentListRepository,
            IRepository<Department> departmentRepository,
            IRepository<Registry> registryRepository,
            IRepository<DocumentHistory> documentHistoryRepository,
            IRepository<Issue> issueRepository,
            IRepository<SentDocument> sentDocumentRepository,
            IRepository<DocumentStatus> documentStatus,
            IRepository<DocumentStatusReason> documentStatusReason,
            IRepository<webpages_Roles> roleRepository,
            IRepository<DocumentType> documentTypeRepository,
            IRepository<ImportanceLevel> importanceLevelRepository,
            IRepository<RelatedPerson> relatedPersonRepository,
            IRepository<Nationality> nationalityRepository,
            IRepository<Attachment>  attachmentRepository,
            IRepository<AttachmentType>  attachmentTypeRepository,
            IRepository<DirectionType> directionTypeRepository,
            IRepository<SecurityLevel> securityLevelRepository,
            IRepository<NotificationType> notificationTypeRepository,
            IRepository<Notification> notificationRepository,
            IRepository<ReadOnlyDepartment> readOnlyDepartmentRepository,
            IRepository<ReadOnlyUser> readOnlyUserRepository,
            IRepository<DocumentProcedure> documentProcedureRepository,
            IRepository<ProcedureStatus> procedureStatusRepository,
            IRepository<User> userRepository)
            : base(contextProvider)
        {
            this.DocumentRepository = documentRepository;
            this.DocumentListRepository = documentListRepository;
            this.DepartmentRepository = departmentRepository;
            this.RegistryRepository = registryRepository;
            this.IssueRepository = issueRepository;
            this.SentDocumentRepository = sentDocumentRepository;
            this.DocumentTypeRepository = documentTypeRepository;
            this.ImportanceLevelRepository = importanceLevelRepository;
            this.RelatedPersonRepository = relatedPersonRepository;
            this.NationalityRepository = nationalityRepository;
            this.AttachmentRepository = attachmentRepository;
            this.AttachmentTypeRepository = attachmentTypeRepository;
            this.DirectionTypeRepository = directionTypeRepository;
            this.SecurityLevelRepository = securityLevelRepository;
            this.NotificationRepository = notificationRepository;
            this.DocumentHistoryRepository = documentHistoryRepository;
            this.ReadOnlyDepartmentRepository = ReadOnlyDepartmentRepository;
            this.ReadOnlyUserRepository = ReadOnlyUserRepository;
            this.UserRepository = userRepository;
            this.DocumentProcedureRepository = documentProcedureRepository;
            this.ProcedureStatusRepository = procedureStatusRepository;
            
            //Lookups
            this.DocumentStatus = documentStatus;
            this.DocumentStatusReason = documentStatusReason;
            this.RoleRepository = roleRepository;
            this.NotificationTypeRepository = notificationTypeRepository;
        }

        public IRepository<Document> DocumentRepository{get; private set;}
        public IDocumentListRepository DocumentListRepository { get; private set; }
        public IRepository<Department> DepartmentRepository { get; private set; }
        public IRepository<Registry> RegistryRepository { get; private set; }
        public IRepository<DocumentHistory> DocumentHistoryRepository { get; private set; }
        public IRepository<Issue> IssueRepository { get; private set; }
        public IRepository<SentDocument> SentDocumentRepository { get; private set; }
        public IRepository<DocumentType> DocumentTypeRepository { get; private set; }
        public IRepository<ImportanceLevel> ImportanceLevelRepository { get; private set; }
        public IRepository<RelatedPerson> RelatedPersonRepository { get; private set; }
        public IRepository<Nationality> NationalityRepository { get; private set; }
        public IRepository<Attachment> AttachmentRepository { get; private set; }
        public IRepository<AttachmentType> AttachmentTypeRepository { get; private set; }
        public IRepository<DirectionType> DirectionTypeRepository { get; private set; }
        public IRepository<SecurityLevel> SecurityLevelRepository { get; private set; }
        public IRepository<Notification> NotificationRepository { get; private set; }
        public IRepository<ReadOnlyDepartment> ReadOnlyDepartmentRepository { get; private set; }
        public IRepository<ReadOnlyUser> ReadOnlyUserRepository { get; private set; }
        public IRepository<User> UserRepository { get; private set; }
        public IRepository<DocumentProcedure> DocumentProcedureRepository { get; private set; }
        public IRepository<ProcedureStatus> ProcedureStatusRepository { get; private set; }
        
        //Lookups
        public IRepository<DocumentStatus> DocumentStatus { get; private set; }
        public IRepository<DocumentStatusReason> DocumentStatusReason { get; private set; }
        public IRepository<webpages_Roles> RoleRepository { get; private set; }
        public IRepository<NotificationType> NotificationTypeRepository { get; private set; }

        
        
    }
}
