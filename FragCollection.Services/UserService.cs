using System.Security.Cryptography;
using System.Text;
using FragCollection.Core.Models;
using FragCollection.IDAL.IRepositories;
using FragCollection.IServices;

namespace FragCollection.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _userRepository.GetByUsernameAsync(username);
        }

        public async Task<User?> AuthenticateAsync(string usernameOrEmail, string password)
        {
            User? user = await _userRepository.GetByUsernameAsync(usernameOrEmail);
            
            if (user == null)
            {
                user = await _userRepository.GetByEmailAsync(usernameOrEmail);
            }

            if (user == null)
            {
                return null;
            }

            if (!VerifyPasswordHash(password, user.PasswordHash))
            {
                return null;
            }

            user.LastLogin = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            return user;
        }

        public async Task<User> RegisterAsync(string username, string email, string password)
        {
            if (await _userRepository.UsernameExistsAsync(username))
            {
                throw new Exception("Username already exists");
            }

            if (await _userRepository.EmailExistsAsync(email))
            {
                throw new Exception("Email already exists");
            }

            var passwordHash = CreatePasswordHash(password);

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                Email = email,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow,
                CollectionName = $"{username}'s Collection",
                CollectionDescription = "My personal fragrance collection"
            };

            return await _userRepository.AddAsync(user);
        }

        public async Task UpdateUserAsync(User user)
        {
            await _userRepository.UpdateAsync(user);
        }

        public async Task UpdateUserCollectionInfoAsync(Guid userId, string name, string description)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            user.CollectionName = name;
            user.CollectionDescription = description;
            
            await _userRepository.UpdateAsync(user);
        }

        public async Task<IEnumerable<User>> GetUsersWithPublicEntriesAsync(int page = 1, int pageSize = 10)
        {
            return await _userRepository.GetUsersWithPublicEntriesAsync(page, pageSize);
        }

        private string CreatePasswordHash(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            var hash = CreatePasswordHash(password);
            return hash == storedHash;
        }
    }
}