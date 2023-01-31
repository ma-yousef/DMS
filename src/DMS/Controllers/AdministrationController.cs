using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Security;
using DMS.Models;
using DMS.Services;
using DMS.Services.Administration;
using WebMatrix.WebData;

namespace DMS.Controllers
{
    public class AdministrationController : BaseController
    {
        private readonly IAdministrationUnitOfWork _unitOfWork;

        public AdministrationController(IAdministrationUnitOfWork unitOfWork)
            : base(unitOfWork)
        {
            this._unitOfWork = unitOfWork;

        }

        [HttpGet]
        public IQueryable<DocumentType> DocumentTypes()
        {
            return this._unitOfWork.DocumentTypeRepository.All();
        }

        [HttpGet]
        public IQueryable<Department> Departments()
        {
            return this._unitOfWork.DepartmentRepository.All();
        }
        [HttpGet]
        public IQueryable<DepartmentType> DepartmentTypes()
        {
            return this._unitOfWork.DepartmentTypeRepository.All();
        }
        [HttpGet]
        public IQueryable<DocumentStatusReason> DocumentStatusReasons()
        {
            return this._unitOfWork.DocumentStatusReasonRepository.All();
        }
        [HttpGet]
        public IQueryable<DocumentStatus> DocumentStatus()
        {
            return this._unitOfWork.DocumentStatusRepository.All();
        }

        [HttpGet]
        public IQueryable<Procedure> Procedures()
        {
            return this._unitOfWork.ProcedureRepository.All();
        }

        [HttpGet]
        public IQueryable<AttachmentType> AttachmentTypes()
        {
            return this._unitOfWork.AttachmentTypeRepository.All();
        }

        [HttpGet]
        public IQueryable<User> Users()
        {
            return this._unitOfWork.UserRepository.All();
        }

        [HttpGet]
        public IQueryable<object> UsersList()
        {
            return this._unitOfWork.UserLisRepository.All();
        }

        [HttpGet]
        public IQueryable<webpages_Roles> Roles()
        {
            return this._unitOfWork.RoleRepository.All();
        }

        [HttpGet]
        public bool IsUserNameExist(string userName)
        {
            return WebSecurity.UserExists(userName);
        }

        [HttpGet]
        [Authorize]
        public int GetUserId()
        {
            return WebSecurity.CurrentUserId;
        }

        [HttpGet]
        [Authorize]
        public object GetCurrentUser()
        {
            User user = _unitOfWork.UserRepository.All(new string[] { "webpages_Roles" }).Where(u => u.Id == WebSecurity.CurrentUserId).SingleOrDefault();
            return new { User = user, Roles = user.webpages_Roles.Select(r => new { r.RoleId, r.RoleName }), Today = DateTime.Today };
        }

        [HttpPost]
        public object CreateUser(UserModel user)
        {
            try
            {
                WebSecurity.CreateUserAndAccount(user.userName, user.password,
                    new
                    {
                        Name = user.name,
                        UserName = user.userName,
                        DepartmentId = user.departmentId,
                        SupervisorId = (user.supervisorId == 0) ? new Nullable<int>() : user.supervisorId,
                        Email = user.email,
                        MobileNo = user.mobileNo,
                        IsAssistantMgr = user.isAssistantMgr,
                        IsAllDocument = user.isAllDocument
                        
                        
                        
                    });

                System.Web.Security.Roles.AddUserToRoles(user.userName, user.roles);
                return new { success = true, userId = WebSecurity.GetUserId(user.userName) };
            }
            catch (Exception ex)
            {
                return new { errors = ex.Message };
            }
        }

        [HttpPost]
        public object UpdateUser(UserModel user)
        {
            try
            {
                DMSEntities entities = new DMSEntities();

                User existingUser = entities.User.Where(u => u.UserName == user.userName).SingleOrDefault();
                existingUser.Name = user.name;
                existingUser.UserName = user.userName;
                existingUser.DepartmentId = user.departmentId;
                existingUser.SupervisorId = (user.supervisorId == 0) ? new Nullable<int>() : user.supervisorId;
                existingUser.Email = user.email;
                existingUser.MobileNo = user.mobileNo;
                existingUser.IsAssistantMgr = user.isAssistantMgr;
                existingUser.IsAllDocument = user.isAllDocument;
                string[] roles = System.Web.Security.Roles.GetRolesForUser(user.userName);
                List<string> rolesToAdd = new List<string>();
                List<string> rolesToRemove = new List<string>();

                foreach (string role in user.roles)
                {
                    if (!roles.Contains(role))
                        rolesToAdd.Add(role);
                }

                foreach (string role in roles)
                {
                    if (!user.roles.Contains(role))
                        rolesToRemove.Add(role);
                }

                if (rolesToRemove.Count > 0)
                    System.Web.Security.Roles.RemoveUserFromRoles(user.userName, rolesToRemove.ToArray());

                if (rolesToAdd.Count > 0)
                    System.Web.Security.Roles.AddUserToRoles(user.userName, rolesToAdd.ToArray());

                entities.SaveChanges();
                return new { success = true, userId = existingUser.Id };
            }
            catch (Exception ex)
            {
                return new { errors = ex.Message };
            }
        }

        [HttpPost]
        public bool ChangePassword(ChangePasswordModel changePasswordModel)
        {
            return WebSecurity.ChangePassword(WebSecurity.CurrentUserName, changePasswordModel.currentPassword, changePasswordModel.newPassword);
        }
    }
}
