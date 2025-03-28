using Microsoft.AspNetCore.Mvc;
using FragCollection.Core.Models;
using FragCollection.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FragCollection.DTOs.Perfume;

namespace FragCollection.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PerfumeEntriesController : ControllerBase
    {
        private readonly IPerfumeEntryService _perfumeEntryService;
        private readonly IUserService _userService;

        public PerfumeEntriesController(
            IPerfumeEntryService perfumeEntryService,
            IUserService userService)
        {
            _perfumeEntryService = perfumeEntryService;
            _userService = userService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<PerfumeEntryResponse>>> GetUserEntries()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized(new { message = "Invalid user ID" });
            }

            var entries = await _perfumeEntryService.GetEntriesByUserIdAsync(userGuid);
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
                // Only allow access to private entries for the owner
                if (User.Identity?.IsAuthenticated != true)
                {
                    return Unauthorized(new { message = "Not authenticated" });
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || entry.UserId != userGuid)
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
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized(new { message = "Invalid user ID" });
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
                UserId = userGuid
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

            // Verify the user has access to the entry
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || entry.UserId != userGuid)
            {
                return Forbid();
            }

            entry.Name = request.Name;
            entry.Brand = request.Brand;
            entry.Type = request.Type;
            entry.Volume = request.Volume;
            entry.PricePerMl = request.PricePerMl;
            entry.IsPublic = request.IsPublic;
            entry.FragranticaUrl = request.FragranticaUrl;

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

            // Verify the user has access to the entry
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || entry.UserId != userGuid)
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

            // Verify the user has access to the entry
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || entry.UserId != userGuid)
            {
                return Forbid();
            }

            await _perfumeEntryService.DeleteEntryAsync(id);
            return NoContent();
        }
    }
}