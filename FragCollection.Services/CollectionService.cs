using FragCollection.Core.Models;
using FragCollection.Interfaces.IRepositories;
using FragCollection.Interfaces.IServices;

namespace FragCollection.Services
{
    public class CollectionService : ICollectionService
    {
        private readonly ICollectionRepository _collectionRepository;

        public CollectionService(ICollectionRepository collectionRepository)
        {
            _collectionRepository = collectionRepository;
        }

        public async Task<IEnumerable<Collection>> GetUserCollectionsAsync(Guid userId)
        {
            return await _collectionRepository.GetByUserIdAsync(userId);
        }

        public async Task<Collection?> GetCollectionByIdAsync(Guid id)
        {
            return await _collectionRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Collection>> GetPublicCollectionsAsync(int page = 1, int pageSize = 10)
        {
            return await _collectionRepository.GetPublicCollectionsAsync(page, pageSize);
        }

        public async Task<Collection> CreateCollectionAsync(Collection collection)
        {
            collection.Id = Guid.NewGuid();
            collection.CreatedAt = DateTime.UtcNow;
            collection.UpdatedAt = DateTime.UtcNow;
            
            return await _collectionRepository.AddAsync(collection);
        }

        public async Task UpdateCollectionAsync(Collection collection)
        {
            collection.UpdatedAt = DateTime.UtcNow;
            await _collectionRepository.UpdateAsync(collection);
        }

        public async Task DeleteCollectionAsync(Guid id)
        {
            await _collectionRepository.DeleteAsync(id);
        }
    }
}