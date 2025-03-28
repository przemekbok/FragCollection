namespace FragCollection.Core.Models
{
    public class Collection
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Foreign keys
        public Guid UserId { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual ICollection<PerfumeEntry> Entries { get; set; } = new List<PerfumeEntry>();
    }
}