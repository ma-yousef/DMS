using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Breeze.WebApi;
using Breeze.WebApi.EF;

namespace DMS.Services.Administration
{
    public class AdministrationUnitOfWork : UnitOfWork, IAdministrationUnitOfWork
    {
        public AdministrationUnitOfWork(EFContextProvider<DMSEntities> contextProvider,
            IRepository<DocumentStatusReason> documentStatusReasonRepository,
            IRepository<DocumentType> documentTypeRepository,
            IRepository<Procedure> procedureRepository,
            IRepository<AttachmentType> attachmentTypeRepository,
            IRepository<User> userRepository,
            IRepository<Department>  departmentRepository,
            IRepository<DepartmentType> departmentTypeRepository,
            IRepository<webpages_Roles> roleRepository,
            IRepository<DocumentStatus> documentStatusRepository,
            IUserListRepository userLisRepository
            )
            : base(contextProvider)
        {
             this.DocumentTypeRepository = documentTypeRepository;
             this.DocumentStatusReasonRepository = documentStatusReasonRepository;
             this.ProcedureRepository = procedureRepository;
             this.AttachmentTypeRepository = attachmentTypeRepository;
             this.UserRepository = userRepository;
             this.DepartmentRepository = departmentRepository;
             this.DepartmentTypeRepository = departmentTypeRepository;
             this.RoleRepository = roleRepository;
             this.DocumentStatusRepository = documentStatusRepository;
             this.UserLisRepository = userLisRepository;
        }

        public IRepository<DocumentType> DocumentTypeRepository { get; private set; }
        public IRepository<DocumentStatusReason> DocumentStatusReasonRepository { get; private set; }
        public IRepository<DocumentStatus> DocumentStatusRepository { get; private set; }
        public IRepository<Procedure> ProcedureRepository { get; private set; }
        public IRepository<AttachmentType> AttachmentTypeRepository { get; private set; }
        public IRepository<User> UserRepository { get; private set; }
        public IRepository<Department> DepartmentRepository { get; private set; }
        public IRepository<DepartmentType> DepartmentTypeRepository { get; private set; }
        public IRepository<webpages_Roles> RoleRepository { get; private set; }
        public IUserListRepository UserLisRepository { get; private set; }
    }
}
