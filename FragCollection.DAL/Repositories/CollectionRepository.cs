using FragCollection.Core.Models;
using FragCollection.IDAL.IRepositories;
using FragCollection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FragCollection.DAL.Repositories
{
    public class CollectionRepository : Repository<Collection>, ICollectionRepository
    {
        public CollectionRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Collection>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Collections
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Collection>> GetPublicCollectionsAsync(int page = 1, int pageSize = 10)
        {
            return await _context.Collections
                .Where(c => c.IsPublic)
                .OrderByDescending(c => c.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}