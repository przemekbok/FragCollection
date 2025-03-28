namespace FragCollection.Core.Models
{
    public class PerfumeInfo
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string FragranticaUrl { get; set; } = string.Empty;
        public DateTime FetchedAt { get; set; }
        public DateTime? LastUpdated { get; set; }
        
        // Navigation properties
        public virtual ICollection<PerfumeEntry> Entries { get; set; } = new List<PerfumeEntry>();
        public virtual ICollection<PerfumeNote> Notes { get; set; } = new List<PerfumeNote>();
    }
}