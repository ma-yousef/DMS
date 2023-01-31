using System;
using System.Collections.Generic;
namespace DMS.Services.Documents
{
    public interface IDocumentListRepository
    {
        System.Linq.IQueryable<Document> All(int userId);
        System.Linq.IQueryable<Document> GetReadOnlyDocuments(int userId);
        System.Linq.IQueryable<Document> GetPopularizationDocuments(int userId);
        System.Linq.IQueryable<SentDocument> GetAllSentDocuments(int userId);
        object getAllDocumentStatus();
        object getAllLateDocument();
        List<Document> getAllDocumentReport();
    }
}
