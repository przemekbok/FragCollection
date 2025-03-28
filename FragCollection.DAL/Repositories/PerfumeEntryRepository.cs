using FragCollection.Core.Models;
using FragCollection.IDAL.IRepositories;
using FragCollection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FragCollection.DAL.Repositories
{
    public class PerfumeEntryRepository : Repository<PerfumeEntry>, IPerfumeEntryRepository
    {
        public PerfumeEntryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<PerfumeEntry>> GetByCollectionIdAsync(Guid collectionId)
        {
            return await _context.PerfumeEntries
                .Where(p => p.CollectionId == collectionId)
                .ToListAsync();
        }

        public async Task<IEnumerable<PerfumeEntry>> GetPublicEntriesAsync(int page = 1, int pageSize = 10)
        {
            return await _context.PerfumeEntries
                .Where(p => p.IsPublic)
                .OrderByDescending(p => p.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task UpdateVolumeAsync(Guid id, decimal newVolume)
        {
            var entry = await GetByIdAsync(id);
            if (entry != null)
            {
                entry.Volume = newVolume;
                entry.UpdatedAt = DateTime.UtcNow;
                await UpdateAsync(entry);
            }
        }
    }
}