using FragCollection.Core.Models;

namespace FragCollection.IServices
{
    public interface IPerfumeEntryService
    {
        Task<IEnumerable<PerfumeEntry>> GetEntriesByUserIdAsync(Guid userId);
        Task<IEnumerable<PerfumeEntry>> GetPublicEntriesByUserIdAsync(Guid userId);
        Task<PerfumeEntry?> GetEntryByIdAsync(Guid id);
        Task<PerfumeEntry> CreateEntryAsync(PerfumeEntry entry);
        Task UpdateEntryAsync(PerfumeEntry entry);
        Task UpdateEntryVolumeAsync(Guid id, decimal newVolume);
        Task DeleteEntryAsync(Guid id);
    }
}