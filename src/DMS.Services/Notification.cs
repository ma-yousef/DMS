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
    
    public partial class Notification : IEntity
    {
        public int Id { get; set; }
        public int NotificationTypeId { get; set; }
        public int UserId { get; set; }
        public System.DateTime Date { get; set; }
        public string Keys { get; set; }
        public string Data { get; set; }
        public bool Read { get; set; }
    
        public virtual NotificationType NotificationType { get; set; }
        public virtual User User { get; set; }
    }
}