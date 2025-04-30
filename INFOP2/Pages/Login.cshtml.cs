using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using INFOP2.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;

namespace INFOP2.Pages
{
    public class LoginModel : PageModel
    {
        private readonly FirebaseAuthService _firebaseAuthService;

        public LoginModel(FirebaseAuthService firebaseAuthService)
        {
            _firebaseAuthService = firebaseAuthService;
        }

        [BindProperty]
        public string Email { get; set; }  // Changed from Username to Email

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
                return Page();
            }

            try
            {
                // Authenticate with Firebase
                var token = await _firebaseAuthService.SignInAsync(Email, Password);

                // Create claims
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

                // Sign in the user
                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);

                return RedirectToPage("/Error");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, ex.Message);
                return Page();
            }
        }
    }
}