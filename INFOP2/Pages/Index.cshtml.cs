using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using INFOP2.Services;

namespace INFOP2.Pages
{
    [Authorize]
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly IConfiguration _configuration;
        private readonly FirestoreService _firestoreService;

        public int PeopleCount { get; set; }
        public int AssetsCount { get; set; }
        public decimal FinanceTotal { get; set; }

        public IndexModel(ILogger<IndexModel> logger, IConfiguration configuration, FirestoreService firestoreService)
        {
            _logger = logger;
            _configuration = configuration;
            _firestoreService = firestoreService;
        }

        public string FirebaseConfigJson { get; set; }

        public async Task OnGetAsync()
        {
            _logger.LogInformation("Dashboard page accessed by {User}", User.Identity?.Name);
            FirebaseConfigJson = System.Text.Json.JsonSerializer.Serialize(_configuration.GetSection("Firebase").Get<Dictionary<string, string>>());
            PeopleCount = await _firestoreService.GetPeopleCountAsync();
            AssetsCount = await _firestoreService.GetAssetsCountAsync();
            FinanceTotal = await _firestoreService.GetFinanceTotalAsync();
        }
    }
}