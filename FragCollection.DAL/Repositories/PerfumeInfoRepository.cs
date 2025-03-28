using FragCollection.Core.Models;
using FragCollection.IDAL.IRepositories;
using FragCollection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FragCollection.DAL.Repositories
{
    public class PerfumeInfoRepository : Repository<PerfumeInfo>, IPerfumeInfoRepository
    {
        public PerfumeInfoRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<PerfumeInfo?> GetByFragranticaUrlAsync(string url)
        {
            return await _context.PerfumeInfos
                .Include(p => p.Notes)
                .FirstOrDefaultAsync(p => p.FragranticaUrl.ToLower() == url.ToLower());
        }
    }
}