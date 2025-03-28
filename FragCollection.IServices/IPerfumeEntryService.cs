using FragCollection.Core.Models;

namespace FragCollection.IServices
{
    public interface IPerfumeEntryService
    {
        Task<IEnumerable<PerfumeEntry>> GetEntriesByCollectionIdAsync(Guid collectionId);
        Task<PerfumeEntry?> GetEntryByIdAsync(Guid id);
        Task<PerfumeEntry> CreateEntryAsync(PerfumeEntry entry);
        Task UpdateEntryAsync(PerfumeEntry entry);
        Task UpdateEntryVolumeAsync(Guid id, decimal newVolume);
        Task DeleteEntryAsync(Guid id);
    }
}