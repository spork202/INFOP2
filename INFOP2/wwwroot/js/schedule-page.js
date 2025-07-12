// schedule-page.js
// All logic moved from Schedule.cshtml inline script

// Use global variables injected from Razor
const firebaseConfig = window.firebaseConfig;
let db = null;
let drivers = [];
let people = [];
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
    loadDrivers();
    loadPeople();
    loadEvents();
};

// --- Begin moved logic from Schedule.cshtml ---

// Utility: Show success message
function showSuccess(message) {
    const card = document.getElementById('success-card');
    document.getElementById('success-message').textContent = message;
    card.classList.remove('d-none');
}

// Utility: Show error message (could be expanded)
function showError(message) {
    alert(message);
}

// Load Drivers from Firestore
async function loadDrivers() {
    if (!db) return;
    try {
        const snapshot = await db.collection('drivers').get();
        drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Optionally render drivers in a dropdown or list if needed
    } catch (error) {
        console.error('Error loading drivers:', error);
    }
}

// Load People from Firestore
async function loadPeople() {
    if (!db) return;
    try {
        const snapshot = await db.collection('people').get();
        people = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Optionally render people in a dropdown or list if needed
    } catch (error) {
        console.error('Error loading people:', error);
    }
}

// Load Events from Firestore
async function loadEvents() {
    if (!db) return;
    try {
        const snapshot = await db.collection('schedule_events').orderBy('DateTime', 'desc').get();
        events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderEvents();
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Render Events to the page
function renderEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;
    if (!events.length) {
        container.innerHTML = '<div class="text-center text-muted py-5">No schedule events found.</div>';
        return;
    }
    container.innerHTML = events.map(event => `
        <div class="card mb-3 shadow-sm border-0 rounded-4">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <h5 class="fw-bold mb-1">${event.Event || ''}</h5>
                        <div class="text-muted small">${event.Subject || ''} | ${event.DateTime ? new Date(event.DateTime).toLocaleString() : ''}</div>
                        <div class="text-muted small">Status: ${event.Status || ''}</div>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-primary me-2" onclick="openEditEventModal('${event.id}')"><i class="fa fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="openDeleteEventModal('${event.id}')"><i class="fa fa-trash"></i></button>
                    </div>
                </div>
                <div class="mb-2"><strong>Drivers:</strong> ${(event.Drivers || []).join(', ')}</div>
                <div class="mb-2"><strong>Programs:</strong> ${(event.Programs || []).join(', ')}</div>
                <div class="mb-2"><strong>Note:</strong> ${event.Note || ''}</div>
                <div class="mb-2"><strong>Remarks:</strong> ${event.Remarks || ''}</div>
                <div class="mb-2"><strong>Closing Notes:</strong> ${event.ClosingNotes || ''}</div>
                <div class="mb-2"><strong>Bible Verse:</strong> ${event.BibleVerse || ''}</div>
            </div>
        </div>
    `).join('');
}

// Add Driver field dynamically
function addDriver(mode) {
    const container = document.getElementById(`${mode}-event-drivers`);
    if (!container) return;
    const idx = container.children.length;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control mb-2';
    input.placeholder = 'Driver Name';
    input.name = `${mode}-driver-${idx}`;
    container.appendChild(input);
}

// Add Program field dynamically
function addProgram(mode) {
    const container = document.getElementById(`${mode}-event-programs`);
    if (!container) return;
    const idx = container.children.length;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control mb-2';
    input.placeholder = 'Program Name';
    input.name = `${mode}-program-${idx}`;
    container.appendChild(input);
}

// Handle Add Driver form submit
$('#add-driver-form').on('submit', async function (e) {
    e.preventDefault();
    const name = $('#add-driver-name').val().trim();
    const contact = $('#add-driver-contact').val().trim();
    if (!name) {
        $('#add-driver-name-error').text('Name is required');
        return;
    }
    try {
        await db.collection('drivers').add({ Name: name, Contact: contact });
        $('#addDriverModal').modal('hide');
        this.reset();
        showSuccess('Driver added successfully!');
        loadDrivers();
    } catch (error) {
        showError('Failed to add driver.');
    }
});

// Handle Edit Driver form submit
$('#edit-driver-form').on('submit', async function (e) {
    e.preventDefault();
    const id = $('#edit-driver-id').val();
    const name = $('#edit-driver-name').val().trim();
    const contact = $('#edit-driver-contact').val().trim();
    if (!name) {
        $('#edit-driver-name-error').text('Name is required');
        return;
    }
    try {
        await db.collection('drivers').doc(id).update({ Name: name, Contact: contact });
        $('#editDriverModal').modal('hide');
        showSuccess('Driver updated successfully!');
        loadDrivers();
    } catch (error) {
        showError('Failed to update driver.');
    }
});

// Handle Add Event form submit
$('#add-event-form').on('submit', async function (e) {
    e.preventDefault();
    const event = $('#add-event-event').val().trim();
    const subject = $('#add-event-subject').val().trim();
    const datetime = $('#add-event-datetime').val();
    const status = $('#add-event-status').val();
    const note = $('#add-event-note').val().trim();
    const remarks = $('#add-event-remarks').val().trim();
    const closingNotes = $('#add-event-closing-notes').val().trim();
    const bibleVerse = $('#add-event-verse').val().trim();
    const drivers = Array.from($('#add-event-drivers input')).map(input => input.value.trim()).filter(Boolean);
    const programs = Array.from($('#add-event-programs input')).map(input => input.value.trim()).filter(Boolean);
    if (!event || !subject || !datetime || !status) {
        // Set error messages as needed
        if (!event) $('#add-event-event-error').text('Event is required');
        if (!subject) $('#add-event-subject-error').text('Subject is required');
        if (!datetime) $('#add-event-datetime-error').text('Date and Time is required');
        if (!status) $('#add-event-status-error').text('Status is required');
        return;
    }
    try {
        await db.collection('schedule_events').add({
            Event: event,
            Subject: subject,
            DateTime: datetime,
            Status: status,
            Note: note,
            Remarks: remarks,
            ClosingNotes: closingNotes,
            BibleVerse: bibleVerse,
            Drivers: drivers,
            Programs: programs
        });
        $('#addEventModal').modal('hide');
        this.reset();
        showSuccess('Event added successfully!');
        loadEvents();
    } catch (error) {
        showError('Failed to add event.');
    }
});

// Handle Edit Event form submit
$('#edit-event-form').on('submit', async function (e) {
    e.preventDefault();
    const id = $('#edit-event-id').val();
    const event = $('#edit-event-event').val().trim();
    const subject = $('#edit-event-subject').val().trim();
    const datetime = $('#edit-event-datetime').val();
    const status = $('#edit-event-status').val();
    const note = $('#edit-event-note').val().trim();
    const remarks = $('#edit-event-remarks').val().trim();
    const closingNotes = $('#edit-event-closing-notes').val().trim();
    const bibleVerse = $('#edit-event-verse').val().trim();
    const drivers = Array.from($('#edit-event-drivers input')).map(input => input.value.trim()).filter(Boolean);
    const programs = Array.from($('#edit-event-programs input')).map(input => input.value.trim()).filter(Boolean);
    if (!event || !subject || !datetime || !status) {
        // Set error messages as needed
        if (!event) $('#edit-event-event-error').text('Event is required');
        if (!subject) $('#edit-event-subject-error').text('Subject is required');
        if (!datetime) $('#edit-event-datetime-error').text('Date and Time is required');
        if (!status) $('#edit-event-status-error').text('Status is required');
        return;
    }
    try {
        await db.collection('schedule_events').doc(id).update({
            Event: event,
            Subject: subject,
            DateTime: datetime,
            Status: status,
            Note: note,
            Remarks: remarks,
            ClosingNotes: closingNotes,
            BibleVerse: bibleVerse,
            Drivers: drivers,
            Programs: programs
        });
        $('#editEventModal').modal('hide');
        showSuccess('Event updated successfully!');
        loadEvents();
    } catch (error) {
        showError('Failed to update event.');
    }
});

// Open Edit Event Modal
window.openEditEventModal = async function (id) {
    const event = events.find(ev => ev.id === id);
    if (!event) return;
    $('#edit-event-id').val(event.id);
    $('#edit-event-event').val(event.Event || '');
    $('#edit-event-subject').val(event.Subject || '');
    $('#edit-event-datetime').val(event.DateTime || '');
    $('#edit-event-status').val(event.Status || '');
    $('#edit-event-note').val(event.Note || '');
    $('#edit-event-remarks').val(event.Remarks || '');
    $('#edit-event-closing-notes').val(event.ClosingNotes || '');
    $('#edit-event-verse').val(event.BibleVerse || '');
    // Populate drivers
    const driversContainer = document.getElementById('edit-event-drivers');
    driversContainer.innerHTML = '';
    (event.Drivers || []).forEach(driver => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control mb-2';
        input.value = driver;
        driversContainer.appendChild(input);
    });
    // Populate programs
    const programsContainer = document.getElementById('edit-event-programs');
    programsContainer.innerHTML = '';
    (event.Programs || []).forEach(program => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control mb-2';
        input.value = program;
        programsContainer.appendChild(input);
    });
    $('#editEventModal').modal('show');
};

// Open Delete Event Modal
window.openDeleteEventModal = function (id) {
    $('#delete-event-id').val(id);
    $('#deleteEventModal').modal('show');
};

// Handle Delete Event
$('#confirm-delete').on('click', async function () {
    const id = $('#delete-event-id').val();
    if (!id) return;
    try {
        await db.collection('schedule_events').doc(id).delete();
        $('#deleteEventModal').modal('hide');
        showSuccess('Event deleted successfully!');
        loadEvents();
    } catch (error) {
        showError('Failed to delete event.');
    }
});

// Export to Excel (simple implementation)
$('#exportBtnSched').on('click', function () {
    // You can use SheetJS or similar library for real export
    alert('Export to Excel functionality is not implemented in this demo.');
});

// --- End moved logic --- 