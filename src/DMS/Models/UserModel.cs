using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DMS.Models
{
    public class UserModel
    {
        public string userName { get; set; }
        public string password { get; set; }
        public string name { get; set; }
        public int departmentId { get; set; }
        public int supervisorId { get; set; }
        public string mobileNo { get; set; }
        public string email { get; set; }
        public bool isAssistantMgr { get; set; }
        public bool isAllDocument { get; set; }
        public string[] roles { get; set; }
    }

    public class ChangePasswordModel
    {
        public string currentPassword { get; set; }
        public string newPassword { get; set; }
    }
}