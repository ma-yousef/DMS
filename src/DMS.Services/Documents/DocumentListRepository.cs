using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DMS.Services.Documents
{
    public class DocumentListRepository : EfRepository<Document>, DMS.Services.Documents.IDocumentListRepository
    {
        public DocumentListRepository(DbContext context)
            : base(context)
        {
        }

        public IQueryable<Document> All(int userId)
        {
            var user = base._context.Set<User>().Where(u => u.Id == userId).Select(u => new { u.DepartmentId, u.SupervisorId,u.IsAssistantMgr,u.IsAllDocument }).SingleOrDefault();
            if (user.IsAllDocument == true) {

                return base._context.Set<Document>();
            }
            else if (user.SupervisorId.HasValue && user.IsAssistantMgr == false )
            {
                List<int> descendantUsers = getAllDescendantUsers(userId);
                descendantUsers.Add(userId);
                return base._context.Set<Document>().Where(d => descendantUsers.Contains(d.CurrentUserId));
            }
            else
            {
                List<int> descendantDepartments = getAllDescendantDepartments(user.DepartmentId);
                descendantDepartments.Add(user.DepartmentId);
                IQueryable<User> users = base._context.Set<User>();
                IQueryable<Document> documents = base._context.Set<Document>();
                var results = (from d in documents
                               join u in users on d.CurrentUserId equals u.Id
                               where descendantDepartments.Contains(u.DepartmentId)
                               select d);
                return results;
            }
        }

        public IQueryable<SentDocument> GetAllSentDocuments(int userId)
        {
            var user = base._context.Set<User>().Where(u => u.Id == userId).Select(u => new { u.DepartmentId, u.SupervisorId, u.IsAssistantMgr }).SingleOrDefault();
            if (user.SupervisorId.HasValue && user.IsAssistantMgr == false)
            {
                List<int> descendantUsers = getAllDescendantUsers(userId);
                descendantUsers.Add(userId);
                return base._context.Set<SentDocument>().Where(d => descendantUsers.Contains(d.FromUserId));
            }
            else
        {
                List<int> descendantDepartments = getAllDescendantDepartments(user.DepartmentId);
                descendantDepartments.Add(user.DepartmentId);
                IQueryable<User> users = base._context.Set<User>();
                IQueryable<SentDocument> documents = base._context.Set<SentDocument>();
                var results = (from d in documents
                               join u in users on d.FromUserId equals u.Id
                               where descendantDepartments.Contains(u.DepartmentId)
                               select d);
                return results;
            }
        }

        public IQueryable<Document> GetReadOnlyDocuments(int userId)
        {
            List<int> descendantUsers = new List<int>();
            List<int> descendantDepartments = new List<int>();
            var user = base._context.Set<User>().Where(u => u.Id == userId).Select(u => new { u.DepartmentId, u.SupervisorId, u.IsAssistantMgr }).SingleOrDefault();

            if (user.SupervisorId.HasValue && user.IsAssistantMgr == false)
                descendantUsers = getAllDescendantUsers(userId);
            else
                descendantDepartments = getAllDescendantDepartments(user.DepartmentId);

            descendantUsers.Add(userId);
            descendantDepartments.Add(user.DepartmentId);
            
            IQueryable<Document> readonlyDocuments1 = base._context.Set<ReadOnlyDepartment>().Where(d => descendantDepartments.Contains(d.DepartmentId) && d.ReadOnlyTypeId == 1).Select(d => d.Document);
            IQueryable<Document> readonlyDocuments2 = base._context.Set<ReadOnlyUser>().Where(d => descendantUsers.Contains(d.UserId) && d.ReadOnlyTypeId == 1).Select(d => d.Document);
            return readonlyDocuments1.Union(readonlyDocuments2);
        }

        public IQueryable<Document> GetPopularizationDocuments(int userId)
        {
            List<int> descendantUsers = new List<int>();
            List<int> descendantDepartments = new List<int>();
            var user = base._context.Set<User>().Where(u => u.Id == userId).Select(u => new { u.DepartmentId, u.SupervisorId,u.IsAssistantMgr }).SingleOrDefault();

            if (user.SupervisorId.HasValue && user.IsAssistantMgr == false)
                descendantUsers = getAllDescendantUsers(userId);
            else
                descendantDepartments = getAllDescendantDepartments(user.DepartmentId);

            descendantUsers.Add(userId);
            descendantDepartments.Add(user.DepartmentId);

            IQueryable<Document> readonlyDocuments1 = base._context.Set<ReadOnlyDepartment>().Where(d => descendantDepartments.Contains(d.DepartmentId) && d.ReadOnlyTypeId == 2).Select(d => d.Document);
            IQueryable<Document> readonlyDocuments2 = base._context.Set<ReadOnlyUser>().Where(d => descendantUsers.Contains(d.UserId) && d.ReadOnlyTypeId == 2).Select(d => d.Document);
            return readonlyDocuments1.Union(readonlyDocuments2);
        }

        public object getAllDocumentStatus()
        {

            IQueryable<Document> documents = base._context.Set<Document>().Where(s=>s.Department1.DepartmentTypeId==1);
            IQueryable<DocumentStatus> documentStatus = base._context.Set<DocumentStatus>();
            var departments = base._context.Set<Department>().Where(d => d.DepartmentTypeId == 1).Select(d => new { d.Id, d.Name }).ToList();


            var depDocsStatusCounts = (from d in documents
                                       where d.DirectionTypeId == 1
                                       group d by new { d.DestinationId, d.DocumentStatusId } into d_document
                                       select new { d_document.Key.DestinationId, d_document.Key.DocumentStatusId, Count = d_document.Count() }).ToList();

            var newDocumentsCount = (from dep in departments
                                     join d in depDocsStatusCounts.Where(d => d.DocumentStatusId == 1)
                                      on dep.Id equals d.DestinationId into dep_doc_count
                                     from dep_doc in dep_doc_count.DefaultIfEmpty()
                                     select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();

            var transferedDocumentsCount = (from dep in departments
                                            join d in depDocsStatusCounts.Where(d => d.DocumentStatusId == 2)
                                             on dep.Id equals d.DestinationId into dep_doc_count
                                            from dep_doc in dep_doc_count.DefaultIfEmpty()
                                            select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();

            var openDocumentsCount = (from dep in departments
                                      join d in depDocsStatusCounts.Where(d => d.DocumentStatusId == 5)
                                       on dep.Id equals d.DestinationId into dep_doc_count
                                      from dep_doc in dep_doc_count.DefaultIfEmpty()
                                      select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();

            var pendingDocumentCount = (from dep in departments
                                        join d in depDocsStatusCounts.Where(d => d.DocumentStatusId == 8)
                                         on dep.Id equals d.DestinationId into dep_doc_count
                                        from dep_doc in dep_doc_count.DefaultIfEmpty()
                                        select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();
            var recieptDocumentsCount = (from dep in departments
                                      join d in depDocsStatusCounts.Where(d => d.DocumentStatusId == 3)
                                       on dep.Id equals d.DestinationId into dep_doc_count
                                      from dep_doc in dep_doc_count.DefaultIfEmpty()
                                      select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();
            DateTime today = DateTime.Today.AddDays(1);
            DateTime today1 = DateTime.Today;
            var depDocsLateCounts = (from d in documents.Where(d => d.ExpiryDate.Value < today1 && d.DirectionTypeId == 1 && d.DocumentStatusId != 9 && d.DestinationId != 7 )
                                     group d by new { d.DestinationId } into d_document
                                     select new { d_document.Key.DestinationId,  Count = d_document.Count() }).ToList();
            var depDocsAllLateCounts = (from d in documents.Where(d => d.ExpiryDate.Value <= today && d.DirectionTypeId == 1 && d.DocumentStatusId != 9 && d.DestinationId != 7)
                                     group d by new { d.DestinationId} into d_document
                                     select new { d_document.Key.DestinationId,  Count = d_document.Count() }).ToList();
            var depDocsTodayCounts = (from d in documents.Where(d => d.ExpiryDate.Value == today1 && d.DirectionTypeId == 1 && d.DocumentStatusId != 9 && d.DestinationId != 7 )
                                     group d by new { d.DestinationId} into d_document
                                     select new { d_document.Key.DestinationId, Count = d_document.Count() }).ToList();
            var depDocsTomorrowCounts = (from d in documents.Where(d => d.ExpiryDate.Value == today && d.DirectionTypeId == 1 && d.DocumentStatusId != 9 && d.DestinationId != 7)
                                     group d by new { d.DestinationId} into d_document
                                     select new { d_document.Key.DestinationId, Count = d_document.Count() }).ToList();
            var TodayDocumentsCount = (from dep in departments
                                       join d in depDocsTodayCounts
                                      on dep.Id equals d.DestinationId into dep_doc_count
                                       from dep_doc in dep_doc_count.DefaultIfEmpty()
                                       select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();
            var LateDocumentsCount = (from dep in departments
                                      join d in depDocsLateCounts
                                      on dep.Id equals d.DestinationId into dep_doc_count
                                      from dep_doc in dep_doc_count.DefaultIfEmpty()
                                      select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();
            var AllLateDocumentsCount = (from dep in departments
                                      join d in depDocsAllLateCounts
                                      on dep.Id equals d.DestinationId into dep_doc_count
                                      from dep_doc in dep_doc_count.DefaultIfEmpty()
                                      select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();
            var TomorrowDocumentsCount = (from dep in departments
                                          join d in depDocsTomorrowCounts
                                          on dep.Id equals d.DestinationId into dep_doc_count
                                          from dep_doc in dep_doc_count.DefaultIfEmpty()
                                          select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();
            
            var result = new
            {
                NewCounts = newDocumentsCount,
                TransferedCounts = transferedDocumentsCount,
                OpenCounts = openDocumentsCount,
                PendingCounts = pendingDocumentCount,
                RecieptCount = recieptDocumentsCount,
                TodayCounts = TodayDocumentsCount,
                LateCounts = LateDocumentsCount,
                TomorrowCounts = TomorrowDocumentsCount,
                AllLateCounts = AllLateDocumentsCount
            };
            return result;

            //                   select new { countDocument = d_document.Count() == null ? 0 : d_document.Count(), destination = d_document.Key }).ToList();
            //var transferedDocument = (from d in documents
            //                   where d.DocumentStatusId == 2
            //                   group d by d.DestinationId into d_document

            //                          select new { countDocument = d_document.Count() == null ? 0 : d_document.Count(), destination = d_document.Key }).ToList();
            //var openDocument = (from d in documents
            //                          where d.DocumentStatusId == 5
            //                          group d by d.DestinationId into d_document

            //                    select new { countDocument = d_document.Count() == null ? 0 : d_document.Count(), destination = d_document.Key }).ToList();
            //var pendingDocument = (from d in documents
            //                    where d.DocumentStatusId == 8
            //                    group d by d.DestinationId into d_document

            //                       select new { countDocument = d_document.Count() == null ? 0 : d_document.Count(), destination = d_document.Key }).ToList(); 

            ////List<int> m = list.Select(d => d.countDocument).ToList();
            //var endList = new { newDocument,transferedDocument,openDocument,pendingDocument};
            //return endList;
        }
        public object getAllLateDocument()
        {

            IQueryable<Document> documents = base._context.Set<Document>();
            IQueryable<DocumentStatus> documentStatus = base._context.Set<DocumentStatus>();
            var departments = base._context.Set<Department>().Select(d => new { d.Id, d.Name }).ToList();


            var depDocsLateCounts = (from d in documents.Where(d => d.ExpiryDate <= DateTime.Today.AddDays(1))
                                       where d.DirectionTypeId == 1
                                     group d by new { d.DestinationId, d.DocumentStatusId } into d_document
                                       select new { d_document.Key.DestinationId, d_document.Key.DocumentStatusId, Count = d_document.Count() }).ToList();
            var TodayDocumentsCount = (from dep in departments
                                       join d in depDocsLateCounts.Where(d => d.DocumentStatusId != 9 && d.DestinationId != 7 && d.DestinationId != 4)
                                      on dep.Id equals d.DestinationId into dep_doc_count
                                     from dep_doc in dep_doc_count.DefaultIfEmpty()
                                     select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();
            var LateDocumentsCount = (from dep in departments
                                      join d in depDocsLateCounts.Where(d => d.DocumentStatusId != 9 && d.DestinationId != 7 && d.DestinationId != 4)
                                      on dep.Id equals d.DestinationId into dep_doc_count
                                       from dep_doc in dep_doc_count.DefaultIfEmpty()
                                       select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();
            var TomorrowDocumentsCount = (from dep in departments
                                      join d in depDocsLateCounts.Where(d => d.DocumentStatusId != 9 && d.DestinationId != 7 && d.DestinationId != 4)
                                      on dep.Id equals d.DestinationId into dep_doc_count
                                      from dep_doc in dep_doc_count.DefaultIfEmpty()
                                      select new { DepartmentId = dep.Id, DepartmentName = dep.Name, Count = (dep_doc != null) ? dep_doc.Count : 0 }).ToArray();
            var result = new
            {
                TodayCounts = TodayDocumentsCount,
                LateCounts = LateDocumentsCount,
                TomorrowCounts = TomorrowDocumentsCount
            };
            return result;

        }

        private List<int> getAllDescendantDepartments(int departmentId)
        {
            List<int> departmentIds = base._context.Set<Department>().Where(d => d.ParentId == departmentId).Select(d => d.Id).ToList();
            List<int> nextLevelDepartmentIds = new List<int>();
            foreach (int id in departmentIds)
            {
                nextLevelDepartmentIds.AddRange(getAllDescendantDepartments(id));
            }
            nextLevelDepartmentIds.AddRange(departmentIds);
            return nextLevelDepartmentIds;
        }

        private List<int> getAllDescendantUsers(int userId)
        {
            List<int> userIds = base._context.Set<User>().Where(u => u.SupervisorId == userId).Select(u => u.Id).ToList();
            List<int> nextLevelUserids = new List<int>();
            foreach (int id in userIds)
            {
                nextLevelUserids.AddRange(getAllDescendantUsers(id));
            }
            nextLevelUserids.AddRange(userIds);
            return nextLevelUserids;
        }

        class temp
        {

            public int id { get; set; }
            public string name { get; set; }

        }
        public List<Document> getAllDocumentReport()
        {
            
            List<Document> documents = base._context.Set<Document>().ToList();
            return documents;

        }

    }
}
