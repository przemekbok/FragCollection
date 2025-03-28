namespace FragCollection.Core.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        
        // Navigation properties
        public virtual ICollection<Collection> Collections { get; set; } = new List<Collection>();
    }
}