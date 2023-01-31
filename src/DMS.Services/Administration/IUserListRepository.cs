using System;
namespace DMS.Services.Administration
{
    public interface IUserListRepository
    {
        System.Linq.IQueryable<object> All();
    }
}
