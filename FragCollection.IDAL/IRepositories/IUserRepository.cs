using FragCollection.Core.Models;

namespace FragCollection.IDAL.IRepositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
        Task<bool> UsernameExistsAsync(string username);
        Task<bool> EmailExistsAsync(string email);
        Task<IEnumerable<User>> GetUsersWithPublicEntriesAsync(int page = 1, int pageSize = 10);
    }
}