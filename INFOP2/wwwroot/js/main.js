// Initialize tooltips only when sidebar is collapsed
function handleTooltips() {
    const sidebarCollapsed = document.getElementById('wrapper').classList.contains('toggled');
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');

    tooltipElements.forEach(el => {
        const tooltip = bootstrap.Tooltip.getInstance(el) || new bootstrap.Tooltip(el);

        if (sidebarCollapsed) {
            tooltip.enable(); // Show tooltips when sidebar is collapsed
        } else {
            tooltip.disable(); // Hide tooltips when sidebar is expanded
        }
    });
}

// Update tooltips when sidebar is toggled
document.getElementById('menu-toggle').addEventListener('click', () => {
    setTimeout(handleTooltips, 50); // Small delay to ensure CSS transition completes
});

// Set initial state on page load
document.addEventListener('DOMContentLoaded', handleTooltips);