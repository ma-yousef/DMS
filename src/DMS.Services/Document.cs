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
    
    public partial class Document : IEntity
    {
        public Document()
        {
            this.Document1 = new HashSet<Document>();
            this.DocumentHistory = new HashSet<DocumentHistory>();
            this.DocumentProcedure = new HashSet<DocumentProcedure>();
            this.ReadOnlyDepartment = new HashSet<ReadOnlyDepartment>();
            this.ReadOnlyUser = new HashSet<ReadOnlyUser>();
            this.RelatedPerson = new HashSet<RelatedPerson>();
            this.SentDocument = new HashSet<SentDocument>();
            this.Attachment = new HashSet<Attachment>();
        }
    
        public int Id { get; set; }
        public int Serial { get; set; }
        public string Subject { get; set; }
        public string Notes { get; set; }
        public int IssueId { get; set; }
        public int RegistryId { get; set; }
        public int SourceId { get; set; }
        public int DestinationId { get; set; }
        public int DirectionTypeId { get; set; }
        public string ExternalId { get; set; }
        public System.DateTime Date { get; set; }
        public int DocumentTypeId { get; set; }
        public int ImportanceLevelId { get; set; }
        public System.DateTime CreationDate { get; set; }
        public int CreatedBy { get; set; }
        public Nullable<int> ParentId { get; set; }
        public int CurrentUserId { get; set; }
        public int DocumentStatusId { get; set; }
        public Nullable<System.DateTime> ExpiryDate { get; set; }
        public bool NeedAnswer { get; set; }
        public int SecurityLevelId { get; set; }
    
        public virtual DirectionType DirectionType { get; set; }
        public virtual ICollection<Document> Document1 { get; set; }
        public virtual Document Document2 { get; set; }
        public virtual DocumentStatus DocumentStatus { get; set; }
        public virtual DocumentType DocumentType { get; set; }
        public virtual ImportanceLevel ImportanceLevel { get; set; }
        public virtual Issue Issue { get; set; }
        public virtual Registry Registry { get; set; }
        public virtual SecurityLevel SecurityLevel { get; set; }
        public virtual ICollection<DocumentHistory> DocumentHistory { get; set; }
        public virtual ICollection<DocumentProcedure> DocumentProcedure { get; set; }
        public virtual ICollection<ReadOnlyDepartment> ReadOnlyDepartment { get; set; }
        public virtual ICollection<ReadOnlyUser> ReadOnlyUser { get; set; }
        public virtual ICollection<RelatedPerson> RelatedPerson { get; set; }
        public virtual ICollection<SentDocument> SentDocument { get; set; }
        public virtual ICollection<Attachment> Attachment { get; set; }
        public virtual User User { get; set; }
        public virtual User User1 { get; set; }
        public virtual Department Department { get; set; }
        public virtual Department Department1 { get; set; }
    }
}