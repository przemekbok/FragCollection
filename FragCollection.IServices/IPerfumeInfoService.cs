using FragCollection.Core.Models;

namespace FragCollection.IServices
{
    public interface IPerfumeInfoService
    {
        Task<PerfumeInfo?> GetByIdAsync(Guid id);
        Task<PerfumeInfo> GetOrFetchByFragranticaUrlAsync(string url);
    }
}