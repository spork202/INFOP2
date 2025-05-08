using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace INFOP2.Pages
{
    [Authorize]
    public class Masterlist : PageModel
    {
        private readonly ILogger<Masterlist> _logger;
        private readonly IConfiguration _configuration;

        public Masterlist(ILogger<Masterlist> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public string FirebaseConfigJson { get; set; }

        [BindProperty(SupportsGet = true)]
        public string SearchTerm { get; set; }

        [BindProperty(SupportsGet = true)]
        public string SortOrder { get; set; } = "name_asc";

        [BindProperty(SupportsGet = true)]
        public int CurrentPage { get; set; } = 1;

        public int PageSize { get; set; } = 10;

        public void OnGet()
        {
            _logger.LogInformation("Masterlist page accessed by {User}", User.Identity.Name);
            FirebaseConfigJson = System.Text.Json.JsonSerializer.Serialize(_configuration.GetSection("Firebase").Get<Dictionary<string, string>>());
        }
    }

    public class Person
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string BCFamily { get; set; } = string.Empty;
        public string Ministry { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public string KSAAddress { get; set; } = string.Empty;
        public System.DateTime? Birthdate { get; set; }
    }
}