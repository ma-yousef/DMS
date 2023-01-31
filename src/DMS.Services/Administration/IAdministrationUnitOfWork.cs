using System;
namespace DMS.Services.Administration
{
    public interface IAdministrationUnitOfWork : IUnitOfWork
    {
        IRepository<DMS.Services.AttachmentType> AttachmentTypeRepository { get; }
        IRepository<DMS.Services.DocumentStatusReason> DocumentStatusReasonRepository { get; }
        IRepository<DMS.Services.DocumentStatus> DocumentStatusRepository { get; }
        IRepository<DMS.Services.DocumentType> DocumentTypeRepository { get; }
        IRepository<DMS.Services.Procedure> ProcedureRepository { get; }
        IRepository<DMS.Services.User> UserRepository { get; }
        IRepository<DMS.Services.Department> DepartmentRepository { get; }
        IRepository<DMS.Services.DepartmentType> DepartmentTypeRepository { get; }
        IRepository<webpages_Roles> RoleRepository { get; }
        IUserListRepository UserLisRepository { get; }
    }
}
