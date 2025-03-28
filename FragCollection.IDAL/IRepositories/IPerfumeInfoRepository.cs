using FragCollection.Core.Models;

namespace FragCollection.IDAL.IRepositories
{
    public interface IPerfumeInfoRepository : IRepository<PerfumeInfo>
    {
        Task<PerfumeInfo?> GetByFragranticaUrlAsync(string url);
    }
}