using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace INFOP2.Pages
{
    public class Assetlist : PageModel
    {
        private readonly ILogger<Assetlist> _logger;

        public Assetlist(ILogger<Assetlist> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {
        }
    }
}