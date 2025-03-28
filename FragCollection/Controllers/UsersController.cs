using Microsoft.AspNetCore.Mvc;
using FragCollection.Core.Models;
using FragCollection.IServices;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text.Json.Serialization;

namespace FragCollection.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var user = await _userService.RegisterAsync(request.Username, request.Email, request.Password);
                return Ok(new UserResponse(user));
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

            // Create claims for the user
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

            return Ok(new UserResponse(user));
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

    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

        [JsonIgnore] // Don't include collections in the response
        public ICollection<Collection> Collections { get; set; } = new List<Collection>();

        public UserResponse(User user)
        {
            Id = user.Id;
            Username = user.Username;
            Email = user.Email;
            CreatedAt = user.CreatedAt;
            LastLogin = user.LastLogin;
        }
    }
}