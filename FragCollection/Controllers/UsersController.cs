using Microsoft.AspNetCore.Mvc;
using FragCollection.Core.Models;
using FragCollection.IServices;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;

namespace FragCollection.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IPerfumeEntryService _perfumeEntryService;
        private readonly IConfiguration _configuration;

        public UsersController(
            IUserService userService, 
            IPerfumeEntryService perfumeEntryService,
            IConfiguration configuration)
        {
            _userService = userService;
            _perfumeEntryService = perfumeEntryService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var user = await _userService.RegisterAsync(request.Username, request.Email, request.Password);
                
                // Generate token
                var jwtSecret = _configuration["JwtSettings:Secret"];
                if (string.IsNullOrEmpty(jwtSecret))
                {
                    jwtSecret = "your_default_secret_key_at_least_32_chars";
                }
                var token = JwtHelper.GenerateJwtToken(user, jwtSecret);
                
                return Ok(new UserResponse(user, token));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserResponse>> Login([FromBody] LoginRequest request)
        {
            var user = await _userService.AuthenticateAsync(request.UsernameOrEmail, request.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username/email or password" });
            }

            // Create claims for the user (used by cookie auth)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = request.RememberMe
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);

            // Generate JWT token as well
            var jwtSecret = _configuration["JwtSettings:Secret"];
            if (string.IsNullOrEmpty(jwtSecret))
            {
                jwtSecret = "your_default_secret_key_at_least_32_chars";
            }
            var token = JwtHelper.GenerateJwtToken(user, jwtSecret);

            return Ok(new UserResponse(user, token));
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("me")]
        public async Task<ActionResult<UserResponse>> GetCurrentUser()
        {
            if (User.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(new { message = "Not authenticated" });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized(new { message = "Invalid user ID" });
            }

            var user = await _userService.GetUserByIdAsync(userGuid);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new UserResponse(user));
        }
        
        [HttpGet("public")]
        public async Task<ActionResult<IEnumerable<UserWithCollectionResponse>>> GetUsersWithPublicEntries([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var users = await _userService.GetUsersWithPublicEntriesAsync(page, pageSize);
            return Ok(users.Select(u => new UserWithCollectionResponse(u)));
        }
        
        [HttpGet("{username}")]
        public async Task<ActionResult<UserWithCollectionResponse>> GetUserByUsername(string username)
        {
            var user = await _userService.GetUserByUsernameAsync(username);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }
            
            return Ok(new UserWithCollectionResponse(user));
        }
        
        [HttpGet("{username}/entries")]
        public async Task<ActionResult<IEnumerable<PerfumeEntryResponse>>> GetPublicEntriesByUsername(string username)
        {
            var user = await _userService.GetUserByUsernameAsync(username);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }
            
            // Check if the requesting user is the owner - if so, return all entries
            if (User.Identity?.IsAuthenticated == true)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!string.IsNullOrEmpty(userId) && Guid.TryParse(userId, out var userGuid) && userGuid == user.Id)
                {
                    var allEntries = await _perfumeEntryService.GetEntriesByUserIdAsync(user.Id);
                    return Ok(allEntries.Select(e => new PerfumeEntryResponse(e)));
                }
            }
            
            // Otherwise return only public entries
            var entries = await _perfumeEntryService.GetPublicEntriesByUserIdAsync(user.Id);
            return Ok(entries.Select(e => new PerfumeEntryResponse(e)));
        }
        
        [HttpPut("collection")]
        [Authorize]
        public async Task<IActionResult> UpdateCollection([FromBody] CollectionUpdateRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            {
                return Unauthorized(new { message = "Invalid user ID" });
            }
            
            try
            {
                await _userService.UpdateUserCollectionInfoAsync(userGuid, request.Name, request.Description);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string UsernameOrEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool RememberMe { get; set; } = false;
    }
    
    public class CollectionUpdateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public string? Token { get; set; }

        public UserResponse(User user, string? token = null)
        {
            Id = user.Id;
            Username = user.Username;
            Email = user.Email;
            CreatedAt = user.CreatedAt;
            LastLogin = user.LastLogin;
            Token = token;
        }
    }
    
    public class UserWithCollectionResponse
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string CollectionDescription { get; set; } = string.Empty;
        
        public UserWithCollectionResponse(User user)
        {
            Id = user.Id;
            Username = user.Username;
            CollectionName = user.CollectionName;
            CollectionDescription = user.CollectionDescription;
        }
    }
    
    // Reuse PerfumeEntryResponse from other controllers
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
        public Guid UserId { get; set; }
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
            UserId = entry.UserId;
            
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