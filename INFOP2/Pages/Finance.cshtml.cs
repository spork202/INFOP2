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
    public class Finance : PageModel
    {
        private readonly ILogger<Finance> _logger;
        private readonly IConfiguration _configuration;

        public Finance(ILogger<Finance> logger,IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }
        public string FirebaseConfigJson { get; set; }
        public List<Transaction> TransactionList { get; set; } = new List<Transaction>();

        [BindProperty]
        public Transaction Input { get; set; } = new Transaction();

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
            _logger.LogInformation("Finance page accessed by {User}", User.Identity.Name);
            FirebaseConfigJson = System.Text.Json.JsonSerializer.Serialize(_configuration.GetSection("Firebase").Get<Dictionary<string, string>>());
        
        }
    }

    public class Transaction
    {
        public string Id { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public double Amount { get; set; }

        [Required(ErrorMessage = "Category is required")]
        public string Category { get; set; } = string.Empty; // Income or Expense

        [DataType(DataType.Date)]
        public DateTime? Date { get; set; }

        public string Notes { get; set; } = string.Empty;
    }
    
}