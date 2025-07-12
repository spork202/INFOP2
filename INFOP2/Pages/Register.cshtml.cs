using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using INFOP2.Services;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace INFOP2.Pages
{
    public class RegisterModel : PageModel
    {
        private readonly FirebaseAuthService _firebaseAuthService;
        private readonly FirestoreService _firestoreService;

        public RegisterModel(FirebaseAuthService firebaseAuthService, FirestoreService firestoreService)
        {
            _firebaseAuthService = firebaseAuthService;
            _firestoreService = firestoreService;
        }

        [BindProperty]
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [BindProperty]
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [BindProperty]
        [Required]
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; }

        public string SuccessMessage { get; set; }
        public string ErrorMessage { get; set; }

        public void OnGet() { }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }
            try
            {
                var uid = await _firebaseAuthService.RegisterAsync(Email, Password);
                await _firestoreService.CreateUserWithRoleAsync(uid, "user");
                TempData["SuccessMessage"] = "Registration successful! You can now log in.";
                return RedirectToPage("/Login");
            }
            catch (System.Exception ex)
            {
                ErrorMessage = ex.Message;
                return Page();
            }
        }
    }
} 