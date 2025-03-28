using FragCollection.Core.Models;

namespace FragCollection.Interfaces.IRepositories
{
    public interface IPerfumeInfoRepository : IRepository<PerfumeInfo>
    {
        Task<PerfumeInfo?> GetByFragranticaUrlAsync(string url);
    }
}