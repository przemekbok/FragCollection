using FragCollection.Core.Models;

namespace FragCollection.DTOs.Perfume
{
    public class PerfumeInfoResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string FragranticaUrl { get; set; } = string.Empty;
        public List<PerfumeNoteResponse> TopNotes { get; set; } = new List<PerfumeNoteResponse>();
        public List<PerfumeNoteResponse> MiddleNotes { get; set; } = new List<PerfumeNoteResponse>();
        public List<PerfumeNoteResponse> BaseNotes { get; set; } = new List<PerfumeNoteResponse>();

        public PerfumeInfoResponse(PerfumeInfo info)
        {
            Id = info.Id;
            Name = info.Name;
            Brand = info.Brand;
            Description = info.Description;
            ImageUrl = info.ImageUrl;
            FragranticaUrl = info.FragranticaUrl;
            
            if (info.Notes != null)
            {
                foreach (var note in info.Notes)
                {
                    var noteResponse = new PerfumeNoteResponse(note);
                    
                    switch (note.Type)
                    {
                        case NoteType.Top:
                            TopNotes.Add(noteResponse);
                            break;
                        case NoteType.Middle:
                            MiddleNotes.Add(noteResponse);
                            break;
                        case NoteType.Base:
                            BaseNotes.Add(noteResponse);
                            break;
                    }
                }
            }
        }
    }
}