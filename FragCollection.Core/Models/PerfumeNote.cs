namespace FragCollection.Core.Models
{
    public enum NoteType
    {
        Top,
        Middle,
        Base
    }

    public class PerfumeNote
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public NoteType Type { get; set; }
        
        // Foreign keys
        public Guid PerfumeInfoId { get; set; }
        
        // Navigation properties
        public virtual PerfumeInfo PerfumeInfo { get; set; } = null!;
    }
}