// prayer-ministry-page.js
// All logic moved from PrayerMinistry.cshtml inline script

// Use global variables injected from Razor
const firebaseConfig = window.firebaseConfig;
let db = null;
let events = [];

// Initialize Firebase
try {
    if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
        throw new Error("Firebase configuration is empty or invalid");
    }
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Load data on page load
window.onload = function () {
    loadEvents();
};

// Load Prayer Events from Firestore
function loadEvents() {
    db.collection('prayer_events').get().then(snapshot => {
        events = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            events.push({
                Id: doc.id,
                Title: data.Title,
                Date: data.Date || '',
                Notes: data.Notes || '',
                Remarks: data.Remarks || '',
                userId: data.userId || null
            });
        });
        renderEvents();
        if (events.length === 0) {
            document.getElementById('events-container').innerHTML = '<p class="text-muted text-center">No prayer events found. Create one to start.</p>';
        }
    }).catch(error => {
        console.error("Error loading events:", error);
        document.getElementById('events-container').innerHTML = '<p class="text-danger text-center">Failed to load events. Please try again.</p>';
    });
}

// Render Prayer Events
function renderEvents() {
    const container = document.getElementById('events-container');
    if (!container) {
        console.error("Element with ID 'events-container' not found");
        return;
    }
    container.innerHTML = '';
    events.forEach(event => {
        const card = `
            <div class="card border-0 shadow-sm rounded-4 mb-4" data-id="${event.Id}">
                <div class="card-header bg-light d-flex justify-content-between align-items-center bd-unset">
                    <div>
                        <h5 class="mb-1">${event.Title}</h5>
                        <p class="text-muted mb-0">Date: ${event.Date || 'N/A'}</p>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-warning" data-bs-tooltip="tooltip" title="Edit" onclick="openEditEvent('${event.Id}')">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" data-bs-tooltip="tooltip" title="Delete" onclick="openDeleteEvent('${event.Id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="fw-semibold mb-2">Notes</h6>
                            <p class="mb-0">${event.Notes || 'N/A'}</p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="fw-semibold mb-2">Remarks</h6>
                            <p class="mb-0">${event.Remarks || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Add Prayer Event
document.getElementById('add-event-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const title = document.getElementById('add-event-title').value.trim();
    const date = document.getElementById('add-event-date').value;
    const notes = document.getElementById('add-event-notes').value.trim();
    const remarks = document.getElementById('add-event-remarks').value.trim();
    document.getElementById('add-event-title-error').innerText = '';
    document.getElementById('add-event-date-error').innerText = '';
    if (!title) {
        document.getElementById('add-event-title-error').innerText = 'Title is required';
        return;
    }
    if (!date) {
        document.getElementById('add-event-date-error').innerText = 'Date is required';
        return;
    }
    const event = {
        Title: title,
        Date: date,
        Notes: notes,
        Remarks: remarks,
        userId: null // Placeholder for no authentication
    };
    db.collection('prayer_events').add(event).then(() => {
        $('#addEventModal').modal('hide');
        document.getElementById('add-event-form').reset();
        loadEvents();
        showSuccess("Prayer event added successfully!");
    }).catch(error => {
        console.error("Error adding event:", error);
        showError("Failed to add event. Please try again.");
    });
});

// Open Edit Event Modal
function openEditEvent(id) {
    const event = events.find(e => e.Id === id);
    if (event) {
        document.getElementById('edit-event-id').value = event.Id;
        document.getElementById('edit-event-title').value = event.Title;
        document.getElementById('edit-event-date').value = event.Date;
        document.getElementById('edit-event-notes').value = event.Notes;
        document.getElementById('edit-event-remarks').value = event.Remarks;
        $('#editEventModal').modal('show');
    }
}

// Edit Prayer Event
document.getElementById('edit-event-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('edit-event-id').value;
    const title = document.getElementById('edit-event-title').value.trim();
    const date = document.getElementById('edit-event-date').value;
    const notes = document.getElementById('edit-event-notes').value.trim();
    const remarks = document.getElementById('edit-event-remarks').value.trim();
    document.getElementById('edit-event-title-error').innerText = '';
    document.getElementById('edit-event-date-error').innerText = '';
    if (!title) {
        document.getElementById('edit-event-title-error').innerText = 'Title is required';
        return;
    }
    if (!date) {
        document.getElementById('edit-event-date-error').innerText = 'Date is required';
        return;
    }
    const event = {
        Title: title,
        Date: date,
        Notes: notes,
        Remarks: remarks,
        userId: null // Placeholder for no authentication
    };
    db.collection('prayer_events').doc(id).update(event).then(() => {
        $('#editEventModal').modal('hide');
        loadEvents();
        showSuccess("Prayer event updated successfully!");
    }).catch(error => {
        console.error("Error updating event:", error);
        showError("Failed to update event. Please try again.");
    });
});

// Open Delete Event Modal
function openDeleteEvent(id) {
    document.getElementById('delete-event-id').value = id;
    $('#deleteEventModal').modal('show');
}

// Delete Prayer Event
document.getElementById('confirm-delete').addEventListener('click', function () {
    const id = document.getElementById('delete-event-id').value;
    db.collection('prayer_events').doc(id).delete().then(() => {
        $('#deleteEventModal').modal('hide');
        loadEvents();
        showSuccess("Prayer event deleted successfully!");
    }).catch(error => {
        console.error("Error deleting event:", error);
        showError("Failed to delete event. Please try again.");
    });
});

// Show Success Message
function showSuccess(message) {
    const successCard = document.getElementById('success-card');
    const successMessage = document.getElementById('success-message');
    if (successCard && successMessage) {
        successMessage.innerText = message;
        successCard.classList.remove('d-none');
        setTimeout(() => successCard.classList.add('d-none'), 5000);
    } else {
        console.error("Success card or message element not found");
    }
}

// Show Error Message
function showError(message) {
    const container = document.getElementById('events-container');
    if (container) {
        container.innerHTML = `<p class="text-danger text-center">${message}</p>`;
    } else {
        console.error("Events container not found");
    }
} 