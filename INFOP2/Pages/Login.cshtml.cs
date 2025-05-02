using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using INFOP2.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace INFOP2.Pages
{
    public class LoginModel : PageModel
    {
        private readonly FirebaseAuthService _firebaseAuthService;
        private readonly ILogger<LoginModel> _logger;

        public LoginModel(FirebaseAuthService firebaseAuthService, ILogger<LoginModel> logger)
        {
            _firebaseAuthService = firebaseAuthService;
            _logger = logger;
        }

        [BindProperty]
        public string Email { get; set; }

        [BindProperty]
        public string Password { get; set; }

        [BindProperty]
        public bool RememberMe { get; set; }

        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Model state is invalid");
                return Page();
            }

            try
            {
                _logger.LogInformation("Attempting Firebase authentication for {Email}", Email);
                var token = await _firebaseAuthService.SignInAsync(Email, Password);
                _logger.LogInformation("Firebase token received for {Email}", Email);

                var claims = new[]
                {
                    new Claim(ClaimTypes.Name, Email),
                    new Claim("FirebaseToken", token)
                };

                var claimsIdentity = new ClaimsIdentity(
                    claims,
                    CookieAuthenticationDefaults.AuthenticationScheme);

                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = RememberMe,
                    ExpiresUtc = RememberMe ? DateTimeOffset.UtcNow.AddDays(30) : DateTimeOffset.UtcNow.AddHours(1)
                };

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);
                _logger.LogInformation("User {Email} signed in successfully, redirecting to /Index", Email);

                return RedirectToPage("/Index");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Authentication failed for {Email}", Email);
                ModelState.AddModelError(string.Empty, "Invalid email or password");
                return Page();
            }
        }
    }
}