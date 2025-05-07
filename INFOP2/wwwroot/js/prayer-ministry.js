// Load event data into edit modal
function loadEventForEdit(id, title, notes, remarks) {
    document.getElementById("editEventId").value = id;
    document.getElementById("editEventTitle").value = title;
    document.getElementById("editEventNotes").value = notes;
    document.getElementById("editEventRemarks").value = remarks;
}