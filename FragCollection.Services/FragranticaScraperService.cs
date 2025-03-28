using System.Net.Http;
using System.Text.RegularExpressions;
using FragCollection.Core.Models;
using FragCollection.IServices;
using HtmlAgilityPack;

namespace FragCollection.Services
{
    public class FragranticaScraperService : IFragranticaScraperService
    {
        private readonly HttpClient _httpClient;

        public FragranticaScraperService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<PerfumeInfo> ScrapeFragranticaUrlAsync(string url)
        {
            // This is a simplified implementation
            // In a real application, you'd need to handle more edge cases and extract more data
            
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to fetch URL: {url}. Status code: {response.StatusCode}");
            }

            var html = await response.Content.ReadAsStringAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var perfumeInfo = new PerfumeInfo
            {
                FragranticaUrl = url,
                Notes = new List<PerfumeNote>()
            };

            // Extract name (simplified example)
            var nameNode = doc.DocumentNode.SelectSingleNode("//h1[@class='fn']");
            if (nameNode != null)
            {
                perfumeInfo.Name = nameNode.InnerText.Trim();
                
                // In Fragrantica, the brand is typically part of the title, like "Brand Name Perfume"
                // This is a simplified approach to extract the brand
                var brandMatch = Regex.Match(perfumeInfo.Name, @"^([^\s]+)");
                if (brandMatch.Success)
                {
                    perfumeInfo.Brand = brandMatch.Groups[1].Value;
                    // Remove brand from name for cleaner display
                    perfumeInfo.Name = perfumeInfo.Name.Substring(perfumeInfo.Brand.Length).Trim();
                }
            }
            else
            {
                perfumeInfo.Name = "Unknown";
                perfumeInfo.Brand = "Unknown";
            }

            // Extract description (simplified example)
            var descNode = doc.DocumentNode.SelectSingleNode("//div[@class='fragrantica-blocktext']");
            if (descNode != null)
            {
                perfumeInfo.Description = descNode.InnerText.Trim();
            }

            // Extract image (simplified example)
            var imgNode = doc.DocumentNode.SelectSingleNode("//img[@class='fragpic']");
            if (imgNode != null)
            {
                perfumeInfo.ImageUrl = imgNode.GetAttributeValue("src", null);
            }

            // Extract notes (simplified example)
            // This is very simplistic - actual Fragrantica notes parsing would be more complex
            var topNotesNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'notes-top')]");
            if (topNotesNode != null)
            {
                foreach (var noteNode in topNotesNode.SelectNodes(".//div[@class='note']"))
                {
                    perfumeInfo.Notes.Add(new PerfumeNote
                    {
                        Name = noteNode.InnerText.Trim(),
                        Type = NoteType.Top,
                    });
                }
            }

            var middleNotesNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'notes-middle')]");
            if (middleNotesNode != null)
            {
                foreach (var noteNode in middleNotesNode.SelectNodes(".//div[@class='note']"))
                {
                    perfumeInfo.Notes.Add(new PerfumeNote
                    {
                        Name = noteNode.InnerText.Trim(),
                        Type = NoteType.Middle,
                    });
                }
            }

            var baseNotesNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'notes-base')]");
            if (baseNotesNode != null)
            {
                foreach (var noteNode in baseNotesNode.SelectNodes(".//div[@class='note']"))
                {
                    perfumeInfo.Notes.Add(new PerfumeNote
                    {
                        Name = noteNode.InnerText.Trim(),
                        Type = NoteType.Base,
                    });
                }
            }

            return perfumeInfo;
        }
    }
}