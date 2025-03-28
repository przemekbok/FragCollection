using Microsoft.AspNetCore.Mvc;
using FragCollection.Core.Models;
using FragCollection.Interfaces.IServices;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace FragCollection.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CollectionsController : ControllerBase
    {
        private readonly ICollectionService _collectionService;

        public CollectionsController(ICollectionService collectionService)
        {
            _collectionService = collectionService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<CollectionResponse>>> GetUserCollections()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized(new { message = "Invalid user ID" });
            }

            var collections = await _collectionService.GetUserCollectionsAsync(userGuid);
            return Ok(collections.Select(c => new CollectionResponse(c)));
        }

        [HttpGet("public")]
        public async Task<ActionResult<IEnumerable<CollectionResponse>>> GetPublicCollections([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var collections = await _collectionService.GetPublicCollectionsAsync(page, pageSize);
            return Ok(collections.Select(c => new CollectionResponse(c)));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CollectionResponse>> GetCollection(Guid id)
        {
            var collection = await _collectionService.GetCollectionByIdAsync(id);
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

            return Ok(new CollectionResponse(collection));
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<CollectionResponse>> CreateCollection([FromBody] CollectionRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized(new { message = "Invalid user ID" });
            }

            var collection = new Collection
            {
                Name = request.Name,
                Description = request.Description,
                IsPublic = request.IsPublic,
                UserId = userGuid
            };

            var createdCollection = await _collectionService.CreateCollectionAsync(collection);
            return CreatedAtAction(nameof(GetCollection), new { id = createdCollection.Id }, new CollectionResponse(createdCollection));
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateCollection(Guid id, [FromBody] CollectionRequest request)
        {
            var collection = await _collectionService.GetCollectionByIdAsync(id);
            if (collection == null)
            {
                return NotFound(new { message = "Collection not found" });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || collection.UserId != userGuid)
            {
                return Forbid();
            }

            collection.Name = request.Name;
            collection.Description = request.Description;
            collection.IsPublic = request.IsPublic;

            await _collectionService.UpdateCollectionAsync(collection);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteCollection(Guid id)
        {
            var collection = await _collectionService.GetCollectionByIdAsync(id);
            if (collection == null)
            {
                return NotFound(new { message = "Collection not found" });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid) || collection.UserId != userGuid)
            {
                return Forbid();
            }

            await _collectionService.DeleteCollectionAsync(id);
            return NoContent();
        }
    }

    public class CollectionRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
    }

    public class CollectionResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;

        public CollectionResponse(Collection collection)
        {
            Id = collection.Id;
            Name = collection.Name;
            Description = collection.Description;
            IsPublic = collection.IsPublic;
            CreatedAt = collection.CreatedAt;
            UpdatedAt = collection.UpdatedAt;
            UserId = collection.UserId;
            Username = collection.User?.Username ?? string.Empty;
        }
    }
}