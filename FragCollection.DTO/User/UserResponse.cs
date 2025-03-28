using System.Text.Json.Serialization;
using FragCollection.Core.Models;

namespace FragCollection.DTO.User
{
    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public string? Token { get; set; }

        public UserResponse(User user, string? token = null)
        {
            Id = user.Id;
            Username = user.Username;
            Email = user.Email;
            CreatedAt = user.CreatedAt;
            LastLogin = user.LastLogin;
            Token = token;
        }
    }
}