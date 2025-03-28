using FragCollection.Core.Models;

namespace FragCollection.Interfaces.IServices
{
    public interface ICollectionService
    {
        Task<IEnumerable<Collection>> GetUserCollectionsAsync(Guid userId);
        Task<Collection?> GetCollectionByIdAsync(Guid id);
        Task<IEnumerable<Collection>> GetPublicCollectionsAsync(int page = 1, int pageSize = 10);
        Task<Collection> CreateCollectionAsync(Collection collection);
        Task UpdateCollectionAsync(Collection collection);
        Task DeleteCollectionAsync(Guid id);
    }
}