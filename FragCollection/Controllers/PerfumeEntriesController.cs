using Microsoft.AspNetCore.Mvc;
using FragCollection.Core.Models;
using FragCollection.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace FragCollection.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerfumeEntriesController : ControllerBase
    {
        private readonly IPerfumeEntryService _perfumeEntryService;
        private readonly ICollectionService _collectionService;

        public PerfumeEntriesController(
            IPerfumeEntryService perfumeEntryService,
            ICollectionService collectionService)
        {
            _perfumeEntryService = perfumeEntryService;
            _collectionService = collectionService;
        }

        [HttpGet("collection/{collectionId}")]
        public async Task<ActionResult<IEnumerable<PerfumeEntryResponse>>> GetEntriesByCollection(Guid collectionId)
        {
            var collection = await _collectionService.GetCollectionByIdAsync(collectionId);
            if (collection == null)
            {
                return NotFound(new { message = "Collection not found" });
            }

            // Check if the collection is public or if the user is the owner
            if (!collection.IsPublic)
            {
                // Only allow access to private collections for the owner
                if (User.Identity?.IsAuthenticated != true)
                {
                    return Unauthorized(new { message = "Not authenticated" });
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || collection.UserId != userGuid)
                {
                    return Forbid();
                }
            }

            var entries = await _perfumeEntryService.GetEntriesByCollectionIdAsync(collectionId);
            return Ok(entries.Select(e => new PerfumeEntryResponse(e)));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PerfumeEntryResponse>> GetEntry(Guid id)
        {
            var entry = await _perfumeEntryService.GetEntryByIdAsync(id);
            if (entry == null)
            {
                return NotFound(new { message = "Entry not found" });
            }

            // Check if the entry is public or if the user is the owner
            if (!entry.IsPublic)
            {
                // Get the collection to check ownership
                var collection = await _collectionService.GetCollectionByIdAsync(entry.CollectionId);
                if (collection == null)
                {
                    return NotFound(new { message = "Collection not found" });
                }

                // Only allow access to private entries for the owner
                if (User.Identity?.IsAuthenticated != true)
                {
                    return Unauthorized(new { message = "Not authenticated" });
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || collection.UserId != userGuid)
                {
                    return Forbid();
                }
            }

            return Ok(new PerfumeEntryResponse(entry));
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<PerfumeEntryResponse>> CreateEntry([FromBody] PerfumeEntryRequest request)
        {
            // Verify the collection exists and the user has access
            var collection = await _collectionService.GetCollectionByIdAsync(request.CollectionId);
            if (collection == null)
            {
                return NotFound(new { message = "Collection not found" });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || collection.UserId != userGuid)
            {
                return Forbid();
            }

            var entry = new PerfumeEntry
            {
                Name = request.Name,
                Brand = request.Brand,
                Type = request.Type,
                Volume = request.Volume,
                PricePerMl = request.PricePerMl,
                IsPublic = request.IsPublic,
                FragranticaUrl = request.FragranticaUrl,
                CollectionId = request.CollectionId
            };

            var createdEntry = await _perfumeEntryService.CreateEntryAsync(entry);
            return CreatedAtAction(nameof(GetEntry), new { id = createdEntry.Id }, new PerfumeEntryResponse(createdEntry));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateEntry(Guid id, [FromBody] PerfumeEntryRequest request)
        {
            var entry = await _perfumeEntryService.GetEntryByIdAsync(id);
            if (entry == null)
            {
                return NotFound(new { message = "Entry not found" });
            }

            // Verify the user has access to the collection
            var collection = await _collectionService.GetCollectionByIdAsync(entry.CollectionId);
            if (collection == null)
            {
                return NotFound(new { message = "Collection not found" });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || collection.UserId != userGuid)
            {
                return Forbid();
            }

            // If changing collection, verify the user has access to the new collection
            if (request.CollectionId != entry.CollectionId)
            {
                var newCollection = await _collectionService.GetCollectionByIdAsync(request.CollectionId);
                if (newCollection == null)
                {
                    return NotFound(new { message = "New collection not found" });
                }

                if (newCollection.UserId != userGuid)
                {
                    return Forbid();
                }
            }

            entry.Name = request.Name;
            entry.Brand = request.Brand;
            entry.Type = request.Type;
            entry.Volume = request.Volume;
            entry.PricePerMl = request.PricePerMl;
            entry.IsPublic = request.IsPublic;
            entry.FragranticaUrl = request.FragranticaUrl;
            entry.CollectionId = request.CollectionId;

            await _perfumeEntryService.UpdateEntryAsync(entry);
            return NoContent();
        }

        [HttpPatch("{id}/volume")]
        [Authorize]
        public async Task<IActionResult> UpdateEntryVolume(Guid id, [FromBody] UpdateVolumeRequest request)
        {
            var entry = await _perfumeEntryService.GetEntryByIdAsync(id);
            if (entry == null)
            {
                return NotFound(new { message = "Entry not found" });
            }

            // Verify the user has access to the collection
            var collection = await _collectionService.GetCollectionByIdAsync(entry.CollectionId);
            if (collection == null)
            {
                return NotFound(new { message = "Collection not found" });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || collection.UserId != userGuid)
            {
                return Forbid();
            }

            await _perfumeEntryService.UpdateEntryVolumeAsync(id, request.Volume);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteEntry(Guid id)
        {
            var entry = await _perfumeEntryService.GetEntryByIdAsync(id);
            if (entry == null)
            {
                return NotFound(new { message = "Entry not found" });
            }

            // Verify the user has access to the collection
            var collection = await _collectionService.GetCollectionByIdAsync(entry.CollectionId);
            if (collection == null)
            {
                return NotFound(new { message = "Collection not found" });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || collection.UserId != userGuid)
            {
                return Forbid();
            }

            await _perfumeEntryService.DeleteEntryAsync(id);
            return NoContent();
        }
    }

    public class PerfumeEntryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public EntryType Type { get; set; }
        public decimal Volume { get; set; }
        public decimal PricePerMl { get; set; }
        public bool IsPublic { get; set; }
        public string? FragranticaUrl { get; set; }
        public Guid CollectionId { get; set; }
    }

    public class UpdateVolumeRequest
    {
        public decimal Volume { get; set; }
    }

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
        public Guid CollectionId { get; set; }
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
            CollectionId = entry.CollectionId;
            
            if (entry.PerfumeInfo != null)
            {
                PerfumeInfo = new PerfumeInfoResponse(entry.PerfumeInfo);
            }
        }
    }

    public class PerfumeInfoResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string FragranticaUrl { get; set; } = string.Empty;
        public List<PerfumeNoteResponse> TopNotes { get; set; } = new List<PerfumeNoteResponse>();
        public List<PerfumeNoteResponse> MiddleNotes { get; set; } = new List<PerfumeNoteResponse>();
        public List<PerfumeNoteResponse> BaseNotes { get; set; } = new List<PerfumeNoteResponse>();

        public PerfumeInfoResponse(PerfumeInfo info)
        {
            Id = info.Id;
            Name = info.Name;
            Brand = info.Brand;
            Description = info.Description;
            ImageUrl = info.ImageUrl;
            FragranticaUrl = info.FragranticaUrl;
            
            if (info.Notes != null)
            {
                foreach (var note in info.Notes)
                {
                    var noteResponse = new PerfumeNoteResponse(note);
                    
                    switch (note.Type)
                    {
                        case NoteType.Top:
                            TopNotes.Add(noteResponse);
                            break;
                        case NoteType.Middle:
                            MiddleNotes.Add(noteResponse);
                            break;
                        case NoteType.Base:
                            BaseNotes.Add(noteResponse);
                            break;
                    }
                }
            }
        }
    }

    public class PerfumeNoteResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public NoteType Type { get; set; }

        public PerfumeNoteResponse(PerfumeNote note)
        {
            Id = note.Id;
            Name = note.Name;
            Type = note.Type;
        }
    }
}