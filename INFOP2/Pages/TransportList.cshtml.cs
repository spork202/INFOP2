using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace INFOP2.Pages
{
    public class TransportList : PageModel
    {
        private readonly ILogger<TransportList> _logger;

        public TransportList(ILogger<TransportList> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {
        }
    }
}