using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace INFOP2.Pages
{
    [Authorize]
    public class CategoryManagement : PageModel
    {
        private readonly ILogger<CategoryManagement> _logger;
        private readonly IConfiguration _configuration;

        public CategoryManagement(ILogger<CategoryManagement> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public string FirebaseConfigJson { get; set; }

        public void OnGet()
        {
            _logger.LogInformation("CategoryManagement page accessed by {User}", User.Identity?.Name);
            FirebaseConfigJson = System.Text.Json.JsonSerializer.Serialize(_configuration.GetSection("Firebase").Get<Dictionary<string, string>>());
        }
    }

    public class Category
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Date { get; set; }
    }

    public class CategoryItem
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
}