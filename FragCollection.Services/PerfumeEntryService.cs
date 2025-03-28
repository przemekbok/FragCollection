using FragCollection.Core.Models;
using FragCollection.IDAL.IRepositories;
using FragCollection.IServices;

namespace FragCollection.Services
{
    public class PerfumeEntryService : IPerfumeEntryService
    {
        private readonly IPerfumeEntryRepository _perfumeEntryRepository;
        private readonly IPerfumeInfoService _perfumeInfoService;

        public PerfumeEntryService(
            IPerfumeEntryRepository perfumeEntryRepository,
            IPerfumeInfoService perfumeInfoService)
        {
            _perfumeEntryRepository = perfumeEntryRepository;
            _perfumeInfoService = perfumeInfoService;
        }

        public async Task<IEnumerable<PerfumeEntry>> GetEntriesByCollectionIdAsync(Guid collectionId)
        {
            return await _perfumeEntryRepository.GetByCollectionIdAsync(collectionId);
        }

        public async Task<PerfumeEntry?> GetEntryByIdAsync(Guid id)
        {
            return await _perfumeEntryRepository.GetByIdAsync(id);
        }

        public async Task<PerfumeEntry> CreateEntryAsync(PerfumeEntry entry)
        {
            entry.Id = Guid.NewGuid();
            entry.AddedAt = DateTime.UtcNow;
            entry.UpdatedAt = DateTime.UtcNow;

            // If Fragrantica URL is provided, fetch perfume info
            if (!string.IsNullOrEmpty(entry.FragranticaUrl))
            {
                var perfumeInfo = await _perfumeInfoService.GetOrFetchByFragranticaUrlAsync(entry.FragranticaUrl);
                entry.PerfumeInfoId = perfumeInfo.Id;
                
                // If name or brand is not provided, use the info from Fragrantica
                if (string.IsNullOrEmpty(entry.Name))
                {
                    entry.Name = perfumeInfo.Name;
                }
                
                if (string.IsNullOrEmpty(entry.Brand))
                {
                    entry.Brand = perfumeInfo.Brand;
                }
            }

            return await _perfumeEntryRepository.AddAsync(entry);
        }

        public async Task UpdateEntryAsync(PerfumeEntry entry)
        {
            entry.UpdatedAt = DateTime.UtcNow;
            
            // If Fragrantica URL changed, update perfume info
            if (!string.IsNullOrEmpty(entry.FragranticaUrl))
            {
                var existingEntry = await _perfumeEntryRepository.GetByIdAsync(entry.Id);
                if (existingEntry?.FragranticaUrl != entry.FragranticaUrl)
                {
                    var perfumeInfo = await _perfumeInfoService.GetOrFetchByFragranticaUrlAsync(entry.FragranticaUrl);
                    entry.PerfumeInfoId = perfumeInfo.Id;
                }
            }
            
            await _perfumeEntryRepository.UpdateAsync(entry);
        }

        public async Task UpdateEntryVolumeAsync(Guid id, decimal newVolume)
        {
            await _perfumeEntryRepository.UpdateVolumeAsync(id, newVolume);
        }

        public async Task DeleteEntryAsync(Guid id)
        {
            await _perfumeEntryRepository.DeleteAsync(id);
        }
    }
}