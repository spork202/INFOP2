using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace INFOP2.Pages
{
    using System.Collections.Generic;

    [Authorize]
    
    
    public class IndexModel : PageModel
    {
        public string FirebaseConfigJson { get; set; }
        private readonly IConfiguration _configuration;
        
        private readonly ILogger<IndexModel> _logger;
    
        public IndexModel(ILogger<IndexModel> logger , IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public void OnGet()
        {
            _logger.LogInformation("Masterlist page accessed by {User}", User.Identity.Name);
            FirebaseConfigJson = System.Text.Json.JsonSerializer.Serialize(_configuration.GetSection("Firebase").Get<Dictionary<string, string>>());
        }
    }
}