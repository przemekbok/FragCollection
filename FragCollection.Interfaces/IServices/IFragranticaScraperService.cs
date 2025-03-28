using FragCollection.Core.Models;

namespace FragCollection.Interfaces.IServices
{
    public interface IFragranticaScraperService
    {
        Task<PerfumeInfo> ScrapeFragranticaUrlAsync(string url);
    }
}