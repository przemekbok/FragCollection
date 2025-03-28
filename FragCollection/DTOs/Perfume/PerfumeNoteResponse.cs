using FragCollection.Core.Models;

namespace FragCollection.DTOs.Perfume
{
    public class PerfumeNoteResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public NoteType Type { get; set; }

        public PerfumeNoteResponse(PerfumeNote note)
        {
            Id = note.Id;
            Name = note.Name;
            Type = note.Type;
        }
    }
}