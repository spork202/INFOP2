using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace INFOP2.Pages
{
    public class Schedule : PageModel
    {
        private readonly ILogger<Schedule> _logger;

        public Schedule(ILogger<Schedule> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {
        }
    }
}