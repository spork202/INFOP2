using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace INFOP2.Pages
{
    public class Finance : PageModel
    {
        private readonly ILogger<Finance> _logger;

        public Finance(ILogger<Finance> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {
        }
    }
}