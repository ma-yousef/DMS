//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DMS.Services
{
    using System;
    using System.Collections.Generic;
    
    public partial class User : IEntity
    {
        public User()
        {
            this.Document = new HashSet<Document>();
            this.Document1 = new HashSet<Document>();
            this.DocumentHistory = new HashSet<DocumentHistory>();
            this.Notification = new HashSet<Notification>();
            this.ReadOnlyUser = new HashSet<ReadOnlyUser>();
            this.SentDocument = new HashSet<SentDocument>();
            this.SentDocument1 = new HashSet<SentDocument>();
            this.User1 = new HashSet<User>();
            this.webpages_Roles = new HashSet<webpages_Roles>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string MobileNo { get; set; }
        public int DepartmentId { get; set; }
        public Nullable<int> SupervisorId { get; set; }
        public Nullable<bool> IsAssistantMgr { get; set; }
        public Nullable<bool> IsAllDocument { get; set; }
    
        public virtual ICollection<Document> Document { get; set; }
        public virtual ICollection<Document> Document1 { get; set; }
        public virtual ICollection<DocumentHistory> DocumentHistory { get; set; }
        public virtual ICollection<Notification> Notification { get; set; }
        public virtual ICollection<ReadOnlyUser> ReadOnlyUser { get; set; }
        public virtual ICollection<SentDocument> SentDocument { get; set; }
        public virtual ICollection<SentDocument> SentDocument1 { get; set; }
        public virtual ICollection<User> User1 { get; set; }
        public virtual User User2 { get; set; }
        public virtual webpages_Membership webpages_Membership { get; set; }
        public virtual ICollection<webpages_Roles> webpages_Roles { get; set; }
        public virtual Department Department { get; set; }
    }
}