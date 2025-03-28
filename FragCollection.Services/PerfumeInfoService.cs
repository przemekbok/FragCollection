using FragCollection.Core.Models;
using FragCollection.IDAL.IRepositories;
using FragCollection.IServices;

namespace FragCollection.Services
{
    public class PerfumeInfoService : IPerfumeInfoService
    {
        private readonly IPerfumeInfoRepository _perfumeInfoRepository;
        private readonly IFragranticaScraperService _fragranticaScraperService;

        public PerfumeInfoService(
            IPerfumeInfoRepository perfumeInfoRepository,
            IFragranticaScraperService fragranticaScraperService)
        {
            _perfumeInfoRepository = perfumeInfoRepository;
            _fragranticaScraperService = fragranticaScraperService;
        }

        public async Task<PerfumeInfo?> GetByIdAsync(Guid id)
        {
            return await _perfumeInfoRepository.GetByIdAsync(id);
        }

        public async Task<PerfumeInfo> GetOrFetchByFragranticaUrlAsync(string url)
        {
            // Try to get from the database first
            var perfumeInfo = await _perfumeInfoRepository.GetByFragranticaUrlAsync(url);

            // If not found or older than 30 days, fetch from Fragrantica
            if (perfumeInfo == null || 
                (perfumeInfo.LastUpdated.HasValue && 
                 (DateTime.UtcNow - perfumeInfo.LastUpdated.Value).TotalDays > 30))
            {
                try
                {
                    var scrapedInfo = await _fragranticaScraperService.ScrapeFragranticaUrlAsync(url);
                    
                    if (perfumeInfo == null)
                    {
                        // Create new entry
                        perfumeInfo = scrapedInfo;
                        perfumeInfo.Id = Guid.NewGuid();
                        perfumeInfo.FetchedAt = DateTime.UtcNow;
                        await _perfumeInfoRepository.AddAsync(perfumeInfo);
                    }
                    else
                    {
                        // Update existing entry
                        perfumeInfo.Name = scrapedInfo.Name;
                        perfumeInfo.Brand = scrapedInfo.Brand;
                        perfumeInfo.Description = scrapedInfo.Description;
                        perfumeInfo.ImageUrl = scrapedInfo.ImageUrl;
                        perfumeInfo.LastUpdated = DateTime.UtcNow;
                        
                        // Update notes
                        // (In a real implementation, you'd need to handle this more carefully)
                        perfumeInfo.Notes.Clear();
                        foreach (var note in scrapedInfo.Notes)
                        {
                            note.Id = Guid.NewGuid();
                            note.PerfumeInfoId = perfumeInfo.Id;
                            perfumeInfo.Notes.Add(note);
                        }
                        
                        await _perfumeInfoRepository.UpdateAsync(perfumeInfo);
                    }
                }
                catch (Exception)
                {
                    // If scraping failed but we have an old entry, return that
                    if (perfumeInfo != null)
                    {
                        return perfumeInfo;
                    }
                    
                    // Otherwise create a minimal entry
                    perfumeInfo = new PerfumeInfo
                    {
                        Id = Guid.NewGuid(),
                        Name = "Unknown",
                        Brand = "Unknown",
                        FragranticaUrl = url,
                        FetchedAt = DateTime.UtcNow
                    };
                    await _perfumeInfoRepository.AddAsync(perfumeInfo);
                }
            }

            return perfumeInfo;
        }
    }
}