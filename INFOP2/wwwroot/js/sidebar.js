const sidebarToggleBtn = document.getElementById("menu-toggle");
const wrapper = document.getElementById("wrapper");

// Load saved state
if (localStorage.getItem("sidebarToggled") === "true") {
    wrapper.classList.add("toggled");
}

// Toggle & save state
sidebarToggleBtn?.addEventListener("click", function () {
    wrapper.classList.toggle("toggled");
    localStorage.setItem("sidebarToggled", wrapper.classList.contains("toggled"));
});
