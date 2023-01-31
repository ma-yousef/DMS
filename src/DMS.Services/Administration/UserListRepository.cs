using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DMS.Services.Administration
{
    public class UserListRepository : EfRepository<User>, DMS.Services.Administration.IUserListRepository
    {
        public UserListRepository(DbContext context)
            : base(context)
        {
        }

        public new IQueryable<object> All()
        {
            return base._context.Set<User>().Include("Department").Include("User2").Include("webpages_Membership").Include("webpages_Roles").OrderByDescending(u=> u.Id)
                .Select(u =>
                 new
                 {
                     u.Id,
                     u.Name,
                     u.UserName,
                     u.DepartmentId,
                     DepartmentName = u.Department.Name,
                     u.MobileNo,
                     u.Email,
                     SupervisorName = u.User2.Name,
                     u.SupervisorId,
                     Active = u.webpages_Membership.IsConfirmed,
                     IsAssistantMgr = u.IsAssistantMgr,
                     IsAllDocument = u.IsAllDocument,
                     Roles = u.webpages_Roles.Select(r => r.RoleId)
                 });
        }

        public void CreateUser(User user)
        {
            base._context.Set<User>().Add(user);
        }
    }
}
