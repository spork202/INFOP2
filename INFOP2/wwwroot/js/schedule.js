// Load Driver Info into Edit Modal
function loadDriverForEdit(id, name, contact) {
    document.getElementById("editDriverId").value = id;
    document.getElementById("editDriverName").value = name;
    document.getElementById("editDriverContact").value = contact;
}

// Export Excel
const exportBtnSched = document.getElementById("exportBtnSched");
if (exportBtnSched) {
    exportBtnSched.addEventListener("click", async () => {
        const db = firebase.firestore(); // Assuming firebase is already initialized
        const snapshot = await db.collection("transport_events").get();
        
        const data = [];

        snapshot.forEach(doc => {
            data.push({
                id: doc.id,
                ...doc.data()
            });
        });

        if (data.length === 0) {
            alert("No data found!");
            return;
        }

        // Convert JSON to worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Create a workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Export to file
        XLSX.writeFile(workbook, "schedule.xlsx");
    });
}