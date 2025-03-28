using FragCollection.Core.Models;
using FragCollection.IDAL.IRepositories;
using FragCollection.DAL.Data;
using Microsoft.EntityFrameworkCore;

namespace FragCollection.DAL.Repositories
{
    public class PerfumeEntryRepository : Repository<PerfumeEntry>, IPerfumeEntryRepository
    {
        public PerfumeEntryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<PerfumeEntry>> GetByUserIdAsync(Guid userId)
        {
            return await _context.PerfumeEntries
                .Where(p => p.UserId == userId)
                .Include(p => p.PerfumeInfo)
                .ThenInclude(pi => pi != null ? pi.Notes : null)
                .ToListAsync();
        }

        public async Task<IEnumerable<PerfumeEntry>> GetPublicEntriesByUserIdAsync(Guid userId)
        {
            return await _context.PerfumeEntries
                .Where(p => p.UserId == userId && p.IsPublic)
                .Include(p => p.PerfumeInfo)
                .ThenInclude(pi => pi != null ? pi.Notes : null)
                .ToListAsync();
        }

        public async Task<IEnumerable<PerfumeEntry>> GetPublicEntriesAsync(int page = 1, int pageSize = 10)
        {
            return await _context.PerfumeEntries
                .Where(p => p.IsPublic)
                .OrderByDescending(p => p.UpdatedAt)
                .Include(p => p.PerfumeInfo)
                .ThenInclude(pi => pi != null ? pi.Notes : null)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public override async Task<PerfumeEntry?> GetByIdAsync(Guid id)
        {
            return await _context.PerfumeEntries
                .Include(p => p.PerfumeInfo)
                .ThenInclude(pi => pi != null ? pi.Notes : null)
                .FirstOrDefaultAsync(p => p.Id == id);
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