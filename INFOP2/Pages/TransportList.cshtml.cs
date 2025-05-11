using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace INFOP2.Pages
{
    public class TransportList : PageModel
    {
      
        private readonly IConfiguration _configuration;
        private readonly ILogger<TransportList> _logger;

        public string FirebaseConfigJson { get; set; }

        public TransportList(IConfiguration configuration, ILogger<TransportList> logger)
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

    public class TransportEvent
    {
        public string EventId { get; set; }
        public string EventName { get; set; }
        public string DriverName { get; set; }
        public string Note { get; set; }
        public string Passengers {get; set;}
        public string Remarks {get; set;}
        public string ClosingNote {get; set;}
        public string BibleVerse {get; set;}

    }
}