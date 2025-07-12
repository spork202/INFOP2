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
        private readonly FirestoreService _firestoreService;
        private readonly ILogger<LoginModel> _logger;

        public LoginModel(FirebaseAuthService firebaseAuthService, FirestoreService firestoreService, ILogger<LoginModel> logger)
        {
            _firebaseAuthService = firebaseAuthService;
            _firestoreService = firestoreService;
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

                await _firestoreService.EnsureUserDocumentAsync(Email);

                var role = await _firestoreService.GetUserRoleByEmailAsync(Email);

                if (role != "admin" && role != "user")
                {
                    _logger.LogWarning("User {Email} attempted to log in with unknown role {Role}, access denied.", Email, role);
                    ModelState.AddModelError(string.Empty, "Access denied. Your account does not have the required permissions.");
                    return Page();
                }

                // Optionally, show a message for users
                if (role == "user")
                {
                    TempData["InfoMessage"] = "You have view-only access.";
                }

                var claims = new[]
                {
                    new Claim(ClaimTypes.Name, Email),
                    new Claim("FirebaseToken", token),
                    new Claim(ClaimTypes.Role, role)
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