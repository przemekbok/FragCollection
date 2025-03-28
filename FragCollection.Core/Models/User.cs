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
        
        // Collection info - now only one collection per user
        public string CollectionName { get; set; } = "My Perfume Collection";
        public string CollectionDescription { get; set; } = string.Empty;
        
        // Navigation properties
        public virtual ICollection<PerfumeEntry> Entries { get; set; } = new List<PerfumeEntry>();
    }
}