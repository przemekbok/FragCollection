using FragCollection.Core.Models;

namespace FragCollection.Interfaces.IServices
{
    public interface IPerfumeInfoService
    {
        Task<PerfumeInfo?> GetByIdAsync(Guid id);
        Task<PerfumeInfo> GetOrFetchByFragranticaUrlAsync(string url);
    }
}