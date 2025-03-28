namespace FragCollection.Core.Models
{
    public enum EntryType
    {
        Bottle,
        Decant
    }

    public class PerfumeEntry
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public EntryType Type { get; set; }
        public decimal Volume { get; set; } // in ml
        public decimal PricePerMl { get; set; } // in PLN
        public bool IsPublic { get; set; }
        public string? FragranticaUrl { get; set; }
        public DateTime AddedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Foreign keys - replaced CollectionId with UserId
        public Guid UserId { get; set; }
        public Guid? PerfumeInfoId { get; set; }
        
        // Navigation properties - replaced Collection with User
        public virtual User User { get; set; } = null!;
        public virtual PerfumeInfo? PerfumeInfo { get; set; }
    }
}