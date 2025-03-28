using Microsoft.AspNetCore.Mvc;
using FragCollection.Core.Models;
using FragCollection.IServices;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using FragCollection.DTOs.User;
using FragCollection.DTOs.Perfume;

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
}