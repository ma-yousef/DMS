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
    
    public partial class NotificationType : IEntity
    {
        public NotificationType()
        {
            this.Notification = new HashSet<Notification>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string Message { get; set; }
        public string Link { get; set; }
    
        public virtual ICollection<Notification> Notification { get; set; }
    }
}
