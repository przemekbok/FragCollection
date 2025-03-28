using FragCollection.Core.Models;

namespace FragCollection.IServices
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(Guid id);
        Task<User?> AuthenticateAsync(string usernameOrEmail, string password);
        Task<User> RegisterAsync(string username, string email, string password);
        Task UpdateUserAsync(User user);
    }
}