using FragCollection.Core.Models;

namespace FragCollection.IDAL.IRepositories
{
    public interface IPerfumeEntryRepository : IRepository<PerfumeEntry>
    {
        Task<IEnumerable<PerfumeEntry>> GetByCollectionIdAsync(Guid collectionId);
        Task<IEnumerable<PerfumeEntry>> GetPublicEntriesAsync(int page = 1, int pageSize = 10);
        Task UpdateVolumeAsync(Guid id, decimal newVolume);
    }
}