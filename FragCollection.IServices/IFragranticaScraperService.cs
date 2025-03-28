using FragCollection.Core.Models;

namespace FragCollection.IServices
{
    public interface IFragranticaScraperService
    {
        Task<PerfumeInfo> ScrapeFragranticaUrlAsync(string url);
    }
}