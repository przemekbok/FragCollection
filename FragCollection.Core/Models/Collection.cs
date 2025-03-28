// This class is no longer used. Collection properties have moved to User model.
// This file will be removed in a future commit after all dependencies are updated.
namespace FragCollection.Core.Models
{
    // @Deprecated - To be removed
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
        
        // Removed entries collection since entries now link directly to users
    }
}