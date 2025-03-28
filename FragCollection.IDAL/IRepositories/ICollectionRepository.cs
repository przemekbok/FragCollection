using FragCollection.Core.Models;

namespace FragCollection.IDAL.IRepositories
{
    public interface ICollectionRepository : IRepository<Collection>
    {
        Task<IEnumerable<Collection>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Collection>> GetPublicCollectionsAsync(int page = 1, int pageSize = 10);
    }
}