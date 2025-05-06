using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace INFOP2.Pages
{
    [Authorize]
    public class Assetlist : PageModel
    {
        private readonly ILogger<Assetlist> _logger;

        public Assetlist(ILogger<Assetlist> logger)
        {
            _logger = logger;
        }

        public List<Asset> AssetList { get; set; } = new List<Asset>();

        [BindProperty]
        public Asset Input { get; set; } = new Asset();

        [BindProperty(SupportsGet = true)]
        public string SearchTerm { get; set; }

        [BindProperty(SupportsGet = true)]
        public string SortOrder { get; set; }

        [BindProperty(SupportsGet = true)]
        public int CurrentPage { get; set; } = 1;

        public int PageSize { get; set; } = 10;
        public int TotalPages { get; set; } = 1; // Default to 1
        public int TotalItems { get; set; }

        public void OnGet()
        {
            _logger.LogInformation("Assetlist page accessed by {User}", User.Identity.Name);
            // Data will be loaded client-side via Firestore
        }
    }

    public class Asset
    {
        public string Id { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string SerialNumber { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        [DataType(DataType.Date)]
        public DateTime? PurchaseDate { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}