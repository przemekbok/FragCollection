using FragCollection.Core.Models;

namespace FragCollection.IDAL.IRepositories
{
    public interface IPerfumeEntryRepository : IRepository<PerfumeEntry>
    {
        Task<IEnumerable<PerfumeEntry>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<PerfumeEntry>> GetPublicEntriesByUserIdAsync(Guid userId);
        Task<IEnumerable<PerfumeEntry>> GetPublicEntriesAsync(int page = 1, int pageSize = 10);
        Task UpdateVolumeAsync(Guid id, decimal newVolume);
    }
}