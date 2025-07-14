using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using INFOP2.Services;

namespace INFOP2.Pages.Admin
{
    [Authorize(Roles = "Admin")]
    public class UserManagementModel : PageModel
    {
        private readonly FirestoreService _firestoreService;
        public List<(string Email, string Role)> Users { get; set; } = new();
        public List<(string Email, string Role)> FilteredUsers =>
            string.IsNullOrWhiteSpace(Search)
                ? Users
                : Users.Where(u => u.Email.Contains(Search, System.StringComparison.OrdinalIgnoreCase)).ToList();

        [BindProperty(SupportsGet = true)]
        public string Search { get; set; }
        [BindProperty]
        public string Email { get; set; }
        [BindProperty]
        public string NewRole { get; set; }
        public Dictionary<string, string> StatusMessages { get; set; } = new();
        public string GlobalMessage { get; set; }
        public string ErrorMessage { get; set; }

        public UserManagementModel(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        public async Task OnGetAsync()
        {
            Users = await _firestoreService.GetAllUsersAsync();
        }

        public async Task<IActionResult> OnPostChangeRoleAsync()
        {
            if (!string.IsNullOrEmpty(Email) && (NewRole == "Admin" || NewRole == "User"))
            {
                await _firestoreService.UpdateUserRoleAsync(Email, NewRole);
                StatusMessages[Email] = $"Role updated to {NewRole}";
                GlobalMessage = $"Role for {Email} updated to {NewRole}.";
            }
            else
            {
                ErrorMessage = "Invalid role or email.";
            }
            Users = await _firestoreService.GetAllUsersAsync();
            return Page();
        }

        public async Task<IActionResult> OnPostDeleteUserAsync()
        {
            if (!string.IsNullOrEmpty(Email))
            {
                try
                {
                    await _firestoreService.DeleteUserAsync(Email);
                    GlobalMessage = $"User {Email} deleted.";
                }
                catch
                {
                    ErrorMessage = $"Failed to delete user {Email}.";
                }
            }
            else
            {
                ErrorMessage = "No email specified.";
            }
            Users = await _firestoreService.GetAllUsersAsync();
            return Page();
        }
    }
} 