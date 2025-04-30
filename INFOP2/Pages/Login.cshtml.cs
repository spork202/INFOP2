using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace INFOP2.Pages
{
    public class LoginModel : PageModel
    {
        [BindProperty]
        public string Username { get; set; }

        [BindProperty]
        public string Password { get; set; }

        [BindProperty]
        public bool RememberMe { get; set; }

        public void OnGet()
        {
        }

        public IActionResult OnPost()
        {
            // Dummy logic – replace with actual authentication
            if (Username == "admin" && Password == "password")
            {
                // Redirect to dashboard or protected page
                return RedirectToPage("/Dashboard/Index");
            }

            ModelState.AddModelError(string.Empty, "Invalid username or password");
            return Page();
        }
    }
}