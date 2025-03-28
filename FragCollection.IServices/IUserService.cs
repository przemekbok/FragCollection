using FragCollection.Core.Models;

namespace FragCollection.IServices
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(Guid id);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User?> AuthenticateAsync(string usernameOrEmail, string password);
        Task<User> RegisterAsync(string username, string email, string password);
        Task UpdateUserAsync(User user);
        Task UpdateUserCollectionInfoAsync(Guid userId, string name, string description);
        Task<IEnumerable<User>> GetUsersWithPublicEntriesAsync(int page = 1, int pageSize = 10);
    }
}