using System;
namespace DMS.Services.Documents
{
    public interface IDocumentUnitOfWork : IUnitOfWork
    {
        IRepository<DMS.Services.Department> DepartmentRepository { get; }
        IRepository<DMS.Services.DocumentHistory> DocumentHistoryRepository { get; }
        IRepository<DMS.Services.Document> DocumentRepository { get; }
        IDocumentListRepository DocumentListRepository { get; }
        IRepository<DMS.Services.DocumentStatus> DocumentStatus { get; }
        IRepository<DMS.Services.Issue> IssueRepository { get; }
        IRepository<DMS.Services.Registry> RegistryRepository { get; }
        IRepository<DMS.Services.SentDocument> SentDocumentRepository { get; }
        IRepository<webpages_Roles> RoleRepository { get; }
        IRepository<Notification> NotificationRepository { get; }
        IRepository<NotificationType> NotificationTypeRepository { get; }
        IRepository<ReadOnlyDepartment> ReadOnlyDepartmentRepository { get; }
        IRepository<ReadOnlyUser> ReadOnlyUserRepository { get; }
        IRepository<User> UserRepository { get; }
        IRepository<DocumentProcedure> DocumentProcedureRepository { get; }
        IRepository<ProcedureStatus> ProcedureStatusRepository { get; } 

        DMS.Services.IRepository<DMS.Services.DocumentType> DocumentTypeRepository { get; }
        DMS.Services.IRepository<DMS.Services.ImportanceLevel> ImportanceLevelRepository { get; }
        DMS.Services.IRepository<DMS.Services.RelatedPerson> RelatedPersonRepository { get; }
        DMS.Services.IRepository<DMS.Services.Nationality> NationalityRepository { get; }
        DMS.Services.IRepository<DMS.Services.AttachmentType> AttachmentTypeRepository { get; }
        DMS.Services.IRepository<DMS.Services.Attachment> AttachmentRepository { get; }
        DMS.Services.IRepository<DMS.Services.DirectionType> DirectionTypeRepository { get; }
        DMS.Services.IRepository<DMS.Services.SecurityLevel> SecurityLevelRepository { get; }
        DMS.Services.IRepository<DMS.Services.DocumentStatusReason> DocumentStatusReason { get; }
    }
}
