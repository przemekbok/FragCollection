using System.Security.Cryptography;
using System.Text;
using FragCollection.Core.Models;
using FragCollection.Interfaces.IRepositories;
using FragCollection.Interfaces.IServices;

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
                CreatedAt = DateTime.UtcNow
            };

            return await _userRepository.AddAsync(user);
        }

        public async Task UpdateUserAsync(User user)
        {
            await _userRepository.UpdateAsync(user);
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