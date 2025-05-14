// Function to toggle sidebar and update icon
function toggleSidebar() {
    const wrapper = document.getElementById('wrapper');
    const menuToggle = document.getElementById('menu-toggle');
    const isCollapsed = wrapper.classList.contains('toggled');

    // Toggle sidebar state
    wrapper.classList.toggle('toggled');

    // Update icon based on state
    if (wrapper.classList.contains('toggled')) {
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>'; // "X" icon when expanded
    } else {
        menuToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>'; // Hamburger icon when collapsed
    }

    // Update tooltips (from previous solution)
    setTimeout(handleTooltips, 50);
}

// Initialize event listener
document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);

// Set initial icon on page load
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>'; // Default: hamburger icon
});

