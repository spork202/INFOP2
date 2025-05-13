// Export Excel
document.getElementById("exportBtnCategories").addEventListener("click", async () => {
    const db = firebase.firestore(); // Assuming firebase is already initialized
    const snapshot = await db.collection("categories").get();


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
    XLSX.writeFile(workbook, "categories.xlsx");
});