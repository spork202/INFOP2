using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace INFOP2.Pages
{
    [Authorize]
    public class Masterlist : PageModel
    {
        private readonly ILogger<Masterlist> _logger;
        private static readonly List<Person> People = new List<Person>
        {
            new Person { Id = Guid.NewGuid().ToString(), Name = "Bong Bengco", BCFamily = "Jude", Ministry = "", ContactNumber = "542103601", KSAAddress = "Sabahoun Sariouna", Birthdate = new DateTime(1976, 04, 07) },
            new Person { Id = Guid.NewGuid().ToString(), Name = "Ian Grenias", BCFamily = "Jude", Ministry = "", ContactNumber = "520308496", KSAAddress = "Sabahoun Sariouna", Birthdate = new DateTime(1996, 07, 27) },
            new Person { Id = Guid.NewGuid().ToString(), Name = "Reiner Puzoa Balbin", BCFamily = "Jude", Ministry = "Music", ContactNumber = "537215389", KSAAddress = "Sabahoun Sariouna", Birthdate = new DateTime(1974, 04, 07) },
            new Person { Id = Guid.NewGuid().ToString(), Name = "Al Francis Maglaya", BCFamily = "Jude", Ministry = "", ContactNumber = "596186837", KSAAddress = "Sabahoun Sariouna", Birthdate = new DateTime(1978, 04, 01) },
            new Person { Id = Guid.NewGuid().ToString(), Name = "Roderick Mendoza", BCFamily = "Jude", Ministry = "", ContactNumber = "507996082", KSAAddress = "Sabahoun Sariouna", Birthdate = new DateTime(1985, 11, 09) },
            new Person { Id = Guid.NewGuid().ToString(), Name = "Ricky Limsin", BCFamily = "Jude", Ministry = "", ContactNumber = "537260237", KSAAddress = "Sabahoun Sariouna", Birthdate = new DateTime(1988, 05, 19) },
            new Person { Id = Guid.NewGuid().ToString(), Name = "Gretchen D. Duran", BCFamily = "Nehemiah", Ministry = "Music/Tambourine", ContactNumber = "506849397", KSAAddress = "Al Malqa", Birthdate = new DateTime(1993, 06, 22) },
            new Person { Id = Guid.NewGuid().ToString(), Name = "Jespher John R. Duran", BCFamily = "Nehemiah", Ministry = "Music/Security", ContactNumber = "531718437", KSAAddress = "Al Malqa", Birthdate = new DateTime(1988, 02, 24) },
            new Person { Id = Guid.NewGuid().ToString(), Name = "Melanie F. Ramirez", BCFamily = "Nehemiah", Ministry = "", ContactNumber = "562617483", KSAAddress = "Al Safaha", Birthdate = new DateTime(1990, 01, 30) },
            new Person { Id = Guid.NewGuid().ToString(), Name = "Nerio Lopez Sago", BCFamily = "Nehemiah", Ministry = "", ContactNumber = "542330644", KSAAddress = "Al Safaha", Birthdate = new DateTime(1997, 02, 25) }
        };

        public Masterlist(ILogger<Masterlist> logger)
        {
            _logger = logger;
        }

        public List<Person> PersonList { get; set; } = new List<Person>();

        [BindProperty]
        public Person Input { get; set; } = new Person();

        [BindProperty(SupportsGet = true)]
        public string SearchTerm { get; set; }

        [BindProperty(SupportsGet = true)]
        public string SortOrder { get; set; }

        [BindProperty(SupportsGet = true)]
        public int CurrentPage { get; set; } = 1;

        public int PageSize { get; set; } = 10;
        public int TotalPages { get; set; }
        public int TotalItems { get; set; }

        public void OnGet()
        {
            _logger.LogInformation("Masterlist page accessed by {User}", User.Identity.Name);

            // Filter by search term
            var filteredList = string.IsNullOrEmpty(SearchTerm)
                ? People
                : People.Where(p => p.Name.ToLower().Contains(SearchTerm.ToLower())).ToList();

            // Sort
            if (SortOrder == "name_desc")
            {
                filteredList = filteredList.OrderByDescending(p => p.Name).ToList();
            }
            else
            {
                filteredList = filteredList.OrderBy(p => p.Name).ToList();
            }

            // Pagination
            TotalItems = filteredList.Count;
            TotalPages = (int)Math.Ceiling((double)TotalItems / PageSize);
            CurrentPage = Math.Max(1, Math.Min(CurrentPage, TotalPages)); // Ensure valid page
            PersonList = filteredList
                .Skip((CurrentPage - 1) * PageSize)
                .Take(PageSize)
                .ToList();
        }

        public IActionResult OnPostAdd()
        {
            if (!ModelState.IsValid)
            {
                PersonList = People;
                return Page();
            }

            Input.Id = Guid.NewGuid().ToString();
            People.Add(Input);
            _logger.LogInformation("Added person: {Name}", Input.Name);
            Input = new Person(); // Reset form
            return RedirectToPage();
        }
    }

    public class Person
    {
        public string Id { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; } = string.Empty;

        public string BCFamily { get; set; } = string.Empty;

        public string Ministry { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Invalid phone number")]
        public string ContactNumber { get; set; } = string.Empty;

        public string KSAAddress { get; set; } = string.Empty;

        [DataType(DataType.Date)]
        public DateTime? Birthdate { get; set; }
    }
}