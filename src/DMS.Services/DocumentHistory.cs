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
    
    public partial class DocumentHistory : IEntity
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        public int DocumentStatusId { get; set; }
        public int UserId { get; set; }
        public System.DateTime Date { get; set; }
        public string Notes { get; set; }
    
        public virtual DocumentStatus DocumentStatus { get; set; }
        public virtual Document Document { get; set; }
        public virtual User User { get; set; }
    }
}