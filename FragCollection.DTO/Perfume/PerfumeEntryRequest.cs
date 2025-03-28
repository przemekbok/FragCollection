using FragCollection.Core.Models;

namespace FragCollection.DTO.Perfume
{
    public class PerfumeEntryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public EntryType Type { get; set; }
        public decimal Volume { get; set; }
        public decimal PricePerMl { get; set; }
        public bool IsPublic { get; set; }
        public string? FragranticaUrl { get; set; }
    }
}