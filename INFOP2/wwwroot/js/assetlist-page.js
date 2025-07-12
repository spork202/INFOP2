// assetlist-page.js
// All logic moved from Assetlist.cshtml inline script

// Use global variables injected from Razor
const firebaseConfig = window.firebaseConfig;
let currentPage = window.currentPage;
const pageSize = window.pageSize;
let sortOrder = window.sortOrder;
let searchTerm = window.searchTerm;

// Declare db globally
let db = null;

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

let assets = [];
let totalItems = 0;
let totalPages = 0;

// Load Assets on page load
window.onload = function () {
    if (!db) {
        console.error("Firestore db is not initialized. Check Firebase configuration and script loading.");
        document.getElementById('no-data').innerText = 'Failed to load data. Please check Firebase configuration.';
        document.getElementById('no-data').style.display = 'block';
        return;
    }
    loadAssets();
};

// Load Assets from Firestore
function loadAssets() {
    let query = db.collection('assets');

    if (searchTerm) {
        query = query.where('Name', '>=', searchTerm.toLowerCase())
                     .where('Name', '<=', searchTerm.toLowerCase() + '\uf8ff');
    }

    query.get().then(snapshot => {
        assets = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            assets.push({
                Id: doc.id,
                Name: data.DisplayName,
                DateIn: data.DateIn ? new Date(data.DateIn.seconds * 1000) : null,
                DateOut: data.DateOut ? new Date(data.DateOut.seconds * 1000) : null,
                Consumable: data.Consumable || '',
                Remarks: data.Remarks || ''
            });
        });

        // Sort
        if (sortOrder === 'name_desc') {
            assets.sort((a, b) => b.Name.localeCompare(a.Name));
        } else {
            assets.sort((a, b) => a.Name.localeCompare(b.Name));
        }

        totalItems = assets.length;
        totalPages = Math.ceil(totalItems / pageSize);
        currentPage = Math.max(1, Math.min(currentPage, totalPages));
        renderTable();
        updateSummary();
        updatePagination();

        if (assets.length === 0) {
            document.getElementById('no-data').style.display = 'block';
        } else {
            document.getElementById('no-data').style.display = 'none';
        }
    }).catch(error => {
        console.error("Error loading assets:", error);
    });
}

// Render Table
function renderTable() {
    const tbody = document.getElementById('asset-table-body');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, assets.length);

    for (let i = start; i < end; i++) {
        const asset = assets[i];
        const row = `
            <tr>
                <td>${asset.Name}</td>
                <td>${asset.DateIn ? asset.DateIn.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''}</td>
                <td>${asset.DateOut ? asset.DateOut.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''}</td>
                <td>${asset.Consumable}</td>
                <td>${asset.Remarks}</td>
                <td>                       
                    <button class="btn btn-sm btn-warning me-1" data-bs-tooltop="tooltip" title="Edit" onclick="openEdit('${asset.Id}')"><i class="fa-solid fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" data-bs-tooltop="tooltip" title="Delete" onclick="openDeleteEvent('${asset.Id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    }
}

// Update Summary
function updateSummary() {
    let totalAssets = assets.length;
    let consumableAssets = assets.filter(asset => asset.Consumable === 'Consumable').length;
    let nonConsumableAssets = assets.filter(asset => asset.Consumable === 'Non-Consumable').length;

    document.getElementById('total-assets').innerText = totalAssets;
    document.getElementById('consumable-assets').innerText = consumableAssets;
    document.getElementById('non-consumable-assets').innerText = nonConsumableAssets;
}

function updatePagination() {
    const start = currentPage === 1 ? 1 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    document.getElementById('pagination-info').innerText = `${start}-${end} of ${totalItems} | Page ${currentPage}`;

    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}" id="prev-page">
            <a class="page-link" href="#" aria-label="Previous"><i class="fa-solid fa-angle-left"></i></a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }

    pagination.innerHTML += `
        <li class="page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}" id="next-page">
            <a class="page-link" href="#" aria-label="Next"><i class="fa-solid fa-angle-right"></i></a>
        </li>
    `;

    document.querySelectorAll('#prev-page a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) changePage(currentPage - 1);
        });
    });

    document.querySelectorAll('#next-page a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) changePage(currentPage + 1);
        });
    });
}

function changePage(page) {
    currentPage = page;
    renderTable();
    updatePagination();
}

// Add Asset
function addAsset() {
    if (!db) {
        console.error("Cannot add asset: Firestore db is not initialized");
        return;
    }
    const name = document.getElementById('add-name').value;
    const dateIn = document.getElementById('add-datein').value;
    const dateOut = document.getElementById('add-dateout').value;
    const consumable = document.getElementById('add-consumable').value;
    const remarks = document.getElementById('add-remarks').value;

    if (!name) {
        document.getElementById('add-name-error').innerText = 'Assets & Equipment is required';
        return;
    }
    if (!dateIn) {
        document.getElementById('add-datein-error').innerText = 'Date In is required';
        return;
    }
    if (!consumable) {
        document.getElementById('add-consumable-error').innerText = 'Consumable/Non is required';
        return;
    }

    const asset = {
        Name: name.toLowerCase(),
        DisplayName: name,
        DateIn: dateIn ? new Date(dateIn) : null,
        DateOut: dateOut ? new Date(dateOut) : null,
        Consumable: consumable,
        Remarks: remarks
    };

    db.collection('assets').add(asset).then(() => {
        $('#addModal').modal('hide');
        document.getElementById('add-name').value = '';
        document.getElementById('add-datein').value = '';
        document.getElementById('add-dateout').value = '';
        document.getElementById('add-consumable').value = '';
        document.getElementById('add-remarks').value = '';
        loadAssets();
        showSuccess("Assets added successfully!");
    }).catch(error => {
        console.error("Error adding asset:", error);
        showError("Failed to add asset.");
    });
}

// Open Edit Modal
function openEdit(id) {
    const asset = assets.find(a => a.Id === id);
    if (asset) {
        document.getElementById('edit-id').value = asset.Id;
        document.getElementById('edit-name').value = asset.Name;
        document.getElementById('edit-datein').value = asset.DateIn ? asset.DateIn.toISOString().split('T')[0] : '';
        document.getElementById('edit-dateout').value = asset.DateOut ? asset.DateOut.toISOString().split('T')[0] : '';
        document.getElementById('edit-consumable').value = asset.Consumable;
        document.getElementById('edit-remarks').value = asset.Remarks;
        $('#editModal').modal('show');
    }
}

// Update Asset
function updateAsset() {
    if (!db) {
        console.error("Cannot update asset: Firestore db is not initialized");
        return;
    }
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value;
    const dateIn = document.getElementById('edit-datein').value;
    const dateOut = document.getElementById('edit-dateout').value;
    const consumable = document.getElementById('edit-consumable').value;
    const remarks = document.getElementById('edit-remarks').value;

    if (!name) {
        document.getElementById('edit-name-error').innerText = 'Assets & Equipment is required';
        return;
    }
    if (!dateIn) {
        document.getElementById('edit-datein-error').innerText = 'Date In is required';
        return;
    }
    if (!consumable) {
        document.getElementById('edit-consumable-error').innerText = 'Consumable/Non is required';
        return;
    }

    const asset = {
        Name: name.toLowerCase(),
        DisplayName: name,
        DateIn: dateIn ? new Date(dateIn) : null,
        DateOut: dateOut ? new Date(dateOut) : null,
        Consumable: consumable,
        Remarks: remarks
    };

    db.collection('assets').doc(id).update(asset).then(() => {
        $('#editModal').modal('hide');
        loadAssets();
    }).catch(error => {
        console.error("Error updating asset:", error);
    });
}

// Open Detail (Placeholder)
function openDetail(id) {
    alert('Detail view for ID: ' + id);
}

// Open Delete Event Modal
function openDeleteEvent(id) {
    document.getElementById('delete-event-id').value = id;
    $('#deleteEventModal').modal('show');
}

// Delete Asset
if (document.getElementById('confirm-delete')) {
    document.getElementById('confirm-delete').addEventListener('click', function () {
        const id = document.getElementById('delete-event-id').value;
        db.collection('assets').doc(id).delete().then(() => {
            $('#deleteEventModal').modal('hide');
            loadAssets();
            showSuccess("Asset deleted successfully!");
        }).catch(error => {
            console.error("Error deleting event:", error);
            showError("Failed to delete event. Please try again.");
        });
    });
}

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

// Search Handler
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            searchTerm = document.getElementById('search-term').value;
            currentPage = 1;
            window.location.href = `/Assetlist?CurrentPage=${currentPage}&SearchTerm=${searchTerm}&SortOrder=${sortOrder}`;
        });
    } else {
        console.error('Search form not found');
    }

    const sortLink = document.getElementById('sort-name');
    if (sortLink) {
        sortLink.addEventListener('click', (e) => {
            e.preventDefault();
            sortOrder = sortOrder === 'name_asc' ? 'name_desc' : 'name_asc';
            window.location.href = `/Assetlist?CurrentPage=${currentPage}&SearchTerm=${searchTerm}&SortOrder=${sortOrder}`;
        });
    } else {
        console.error('Sort link not found');
    }
}); 