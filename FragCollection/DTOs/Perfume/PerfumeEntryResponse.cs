using FragCollection.Core.Models;

namespace FragCollection.DTOs.Perfume
{
    public class PerfumeEntryResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public EntryType Type { get; set; }
        public decimal Volume { get; set; }
        public decimal PricePerMl { get; set; }
        public decimal TotalPrice => Volume * PricePerMl;
        public bool IsPublic { get; set; }
        public string? FragranticaUrl { get; set; }
        public DateTime AddedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid UserId { get; set; }
        public PerfumeInfoResponse? PerfumeInfo { get; set; }

        public PerfumeEntryResponse(PerfumeEntry entry)
        {
            Id = entry.Id;
            Name = entry.Name;
            Brand = entry.Brand;
            Type = entry.Type;
            Volume = entry.Volume;
            PricePerMl = entry.PricePerMl;
            IsPublic = entry.IsPublic;
            FragranticaUrl = entry.FragranticaUrl;
            AddedAt = entry.AddedAt;
            UpdatedAt = entry.UpdatedAt;
            UserId = entry.UserId;
            
            if (entry.PerfumeInfo != null)
            {
                PerfumeInfo = new PerfumeInfoResponse(entry.PerfumeInfo);
            }
        }
    }
}