// masterlist-page.js
// All logic moved from Masterlist.cshtml inline script

// Use global variables injected from Razor
const firebaseConfig = window.firebaseConfig;
let currentPage = window.currentPage;
const pageSize = window.pageSize;
let sortOrder = window.sortOrder;
let searchTerm = window.searchTerm;

let db = null;
let people = [];
let bsFamilies = [];
let ministries = [];
let totalItems = 0;
let totalPages = 0;

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

window.onload = function () {
    if (!db) {
        console.error("Firestore db is not initialized.");
        showError("Failed to load data. Please check Firebase configuration.");
        return;
    }
    loadCategories();
    loadPeople();
};

// Load Categories (BS Family and Ministry)
async function loadCategories() {
    try {
        const snapshot = await db.collection('categories').get();
        bsFamilies = [];
        ministries = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (data.Title && data.Title.toLowerCase() === "bs family") {
                const itemsSnapshot = await db.collection('categories').doc(doc.id).collection('items').get();
                bsFamilies = itemsSnapshot.docs.map(itemDoc => ({
                    Id: itemDoc.id,
                    Name: itemDoc.data().Name || "Unknown"
                }));
            } else if (data.Title && data.Title.toLowerCase() === "ministry") {
                const itemsSnapshot = await db.collection('categories').doc(doc.id).collection('items').get();
                ministries = itemsSnapshot.docs.map(itemDoc => ({
                    Id: itemDoc.id,
                    Name: itemDoc.data().Name || "Unknown"
                }));
            }
        }
        populateDropdowns();
    } catch (error) {
        console.error("Error loading categories:", error);
        showError(`Failed to load BS Families or Ministries: ${error.message}`);
    }
}

// Populate BS Family and Ministry Dropdowns
function populateDropdowns() {
    const addBSFamily = document.getElementById('add-bsfamily');
    const editBSFamily = document.getElementById('edit-bsfamily');
    const addMinistry = document.getElementById('add-ministry');
    const editMinistry = document.getElementById('edit-ministry');
    addBSFamily.innerHTML = '<option value="" disabled selected>Select BS Family</option><option value="None">None</option>';
    editBSFamily.innerHTML = '<option value="" disabled>Select BS Family</option><option value="None">None</option>';
    addMinistry.innerHTML = '<option value="" disabled selected>Select Ministry</option><option value="None">None</option>';
    editMinistry.innerHTML = '<option value="" disabled>Select Ministry</option><option value="None">None</option>';
    bsFamilies.forEach(family => {
        const option = `<option value="${family.Name}">${family.Name}</option>`;
        addBSFamily.innerHTML += option;
        editBSFamily.innerHTML += option;
    });
    ministries.forEach(ministry => {
        const option = `<option value="${ministry.Name}">${ministry.Name}</option>`;
        addMinistry.innerHTML += option;
        editMinistry.innerHTML += option;
    });
}

function loadPeople() {
    try {
        let query = db.collection('people');
        if (searchTerm) {
            query = query.where('Name', '>=', searchTerm.toLowerCase())
                         .where('Name', '<=', searchTerm.toLowerCase() + '\uf8ff');
        }
        query.get().then(snapshot => {
            people = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                people.push({
                    Id: doc.id,
                    Name: data.DisplayName || data.Name || '',
                    Nickname: data.Nickname || '',
                    BSFamily: data.BSFamily || '',
                    Ministry: data.Ministry || '',
                    ContactNumber: data.ContactNumber || '',
                    Birthdate: data.Birthdate ? (data.Birthdate.seconds ? new Date(data.Birthdate.seconds * 1000) : new Date(data.Birthdate)) : null,
                    CountryAddress: data.CountryAddress || '',
                    KSAAddress: data.KSAAddress || '',
                    Company: data.Company || '',
                    JobPosition: data.JobPosition || '',
                    FirstWorshipDate: data.FirstWorshipDate ? (data.FirstWorshipDate.seconds ? new Date(data.FirstWorshipDate.seconds * 1000) : new Date(data.FirstWorshipDate)) : null,
                    BaptizedDate: data.BaptizedDate ? (data.BaptizedDate.seconds ? new Date(data.BaptizedDate.seconds * 1000) : new Date(data.BaptizedDate)) : null,
                    Remarks: data.Remarks || ''
                });
            });
            if (sortOrder === 'name_desc') {
                people.sort((a, b) => b.Name.localeCompare(a.Name));
            } else {
                people.sort((a, b) => a.Name.localeCompare(b.Name));
            }
            totalItems = people.length;
            totalPages = Math.ceil(totalItems / pageSize);
            currentPage = Math.max(1, Math.min(currentPage, totalPages));
            renderTable();
            updatePagination();
            updateSummary();
        }).catch(error => {
            console.error("Error loading people:", error);
            showError("Error loading people from Firestore.");
        });
    } catch (error) {
        console.error("Unexpected error in loadPeople:", error);
        showError("Unexpected error loading data.");
    }
}

function renderTable() {
    const tbody = document.getElementById('person-table-body');
    tbody.innerHTML = '';
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, people.length);
    function formatDate(date) {
        if (!date) return 'N/A';
        if (!(date instanceof Date)) date = new Date(date);
        if (isNaN(date)) return 'N/A';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    for (let i = start; i < end; i++) {
        const person = people[i];
        const row = `
            <tr>
                <td>${person.Name || 'N/A'}</td>
                <td>${person.Nickname || 'N/A'}</td>
                <td>${person.BSFamily || 'N/A'}</td>
                <td>${person.Ministry || 'N/A'}</td>
                <td>${person.ContactNumber || 'N/A'}</td>
                <td>${formatDate(person.Birthdate)}</td>
                <td>${person.CountryAddress || 'N/A'}</td>
                <td>${person.KSAAddress || 'N/A'}</td>
                <td>${person.Company || 'N/A'}</td>
                <td>${person.JobPosition || 'N/A'}</td>
                <td>${formatDate(person.FirstWorshipDate)}</td>
                <td>${formatDate(person.BaptizedDate)}</td>
                <td>${person.Remarks || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" data-bs-tooltip="tooltip" title="Edit" onclick="openEdit('${person.Id}')"><i class="fa-solid fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" data-bs-tooltip="tooltip" title="Delete" onclick="openDeleteEvent('${person.Id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    }
}

function updateSummary() {
    const totalPeople = people.length;
    const bsFamiliesSet = [...new Set(people.map(p => p.BSFamily).filter(f => f && f !== 'None'))];
    const ministriesSet = [...new Set(people.map(p => p.Ministry).filter(m => m && m !== 'None'))];
    document.getElementById('total-people').innerText = totalPeople;
    document.getElementById('bs-families').innerText = bsFamiliesSet.length;
    document.getElementById('ministries').innerText = ministriesSet.length;
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

// Copy All People Data
function copyAllData(button) {
    if (people.length === 0) {
        showError('No people to copy.');
        return;
    }
    const rows = people.map(person => {
        const birthdate = person.Birthdate
            ? person.Birthdate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
            : 'N/A';
        const displayName = person.DisplayName || person.Name || '';
        return [
            `• Name: ${displayName}`,
            `  - BS Family: ${person.BSFamily || 'N/A'}`,
            `  - Ministry: ${person.Ministry || 'N/A'}`,
            `  - Contact No.: ${person.ContactNumber || 'N/A'}`,
            `  - KSA Address: ${person.KSAAddress || 'N/A'}`,
            `  - Birthdate: ${birthdate}`
        ].join('\n');
    });
    const textToCopy = rows.join('\n\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
        const feedback = document.createElement('span');
        feedback.className = 'copy-feedback';
        feedback.innerText = 'Copied!';
        button.parentElement.appendChild(feedback);
        const rect = button.getBoundingClientRect();
        feedback.style.top = `${rect.top - 30}px`;
        feedback.style.left = `${rect.left + rect.width / 2}px`;
        feedback.classList.add('show');
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy all data:', err);
        showError('Failed to copy people data.');
    });
}

function addPerson() {
    if (!db) {
        console.error("Cannot add person: Firestore db is not initialized");
        showError("Failed to save person. Database not initialized.");
        return;
    }
    const name = document.getElementById('add-name').value.trim();
    const nickname = document.getElementById('add-nickname').value.trim();
    const bsFamily = document.getElementById('add-bsfamily').value;
    const ministry = document.getElementById('add-ministry').value;
    const contactNumber = document.getElementById('add-contactnumber').value.trim();
    const ksaAddress = document.getElementById('add-ksaaddress').value.trim();
    const countryAddress = document.getElementById('add-countryaddress').value.trim();
    const company = document.getElementById('add-company').value.trim();
    const jobPosition = document.getElementById('add-jobposition').value.trim();
    const firstWorshipDate = document.getElementById('add-firstworshipdate').value;
    const baptizedDate = document.getElementById('add-baptizeddate').value;
    const remarks = document.getElementById('add-remarks').value.trim();
    const birthdate = document.getElementById('add-birthdate').value;
    document.getElementById('add-name-error').innerText = '';
    document.getElementById('add-bsfamily-error').innerText = '';
    document.getElementById('add-ministry-error').innerText = '';
    document.getElementById('add-contactnumber-error').innerText = '';
    if (!name) {
        document.getElementById('add-name-error').innerText = 'Name is required';
        return;
    }
    if (!bsFamily) {
        document.getElementById('add-bsfamily-error').innerText = 'BS Family is required';
        return;
    }
    if (!ministry) {
        document.getElementById('add-ministry-error').innerText = 'Ministry is required';
        return;
    }
    if (contactNumber && !/^\+?\d{10,15}$/.test(contactNumber)) {
        document.getElementById('add-contactnumber-error').innerText = 'Invalid phone number';
        return;
    }
    const person = {
        Name: name.toLowerCase(),
        DisplayName: name,
        Nickname: nickname,
        BSFamily: bsFamily,
        Ministry: ministry,
        ContactNumber: contactNumber,
        KSAAddress: ksaAddress,
        CountryAddress: countryAddress,
        Company: company,
        JobPosition: jobPosition,
        FirstWorshipDate: firstWorshipDate ? new Date(firstWorshipDate) : null,
        BaptizedDate: baptizedDate ? new Date(baptizedDate) : null,
        Remarks: remarks,
        Birthdate: birthdate ? new Date(birthdate) : null
    };
    db.collection('people').add(person).then(() => {
        $('#addModal').modal('hide');
        document.getElementById('add-name').value = '';
        document.getElementById('add-nickname').value = '';
        document.getElementById('add-bsfamily').value = '';
        document.getElementById('add-ministry').value = '';
        document.getElementById('add-contactnumber').value = '';
        document.getElementById('add-ksaaddress').value = '';
        document.getElementById('add-countryaddress').value = '';
        document.getElementById('add-company').value = '';
        document.getElementById('add-jobposition').value = '';
        document.getElementById('add-firstworshipdate').value = '';
        document.getElementById('add-baptizeddate').value = '';
        document.getElementById('add-remarks').value = '';
        document.getElementById('add-birthdate').value = '';
        document.getElementById('add-name-error').innerText = '';
        document.getElementById('add-bsfamily-error').innerText = '';
        document.getElementById('add-ministry-error').innerText = '';
        document.getElementById('add-contactnumber-error').innerText = '';
        loadPeople();
        showSuccess("Person added successfully!");
    }).catch(error => {
        console.error("Error adding person:", error);
        showError("Failed to add person.");
    });
}

function openEdit(id) {
    const person = people.find(p => p.Id === id);
    if (person) {
        document.getElementById('edit-id').value = person.Id;
        document.getElementById('edit-name').value = person.DisplayName || person.Name || '';
        document.getElementById('edit-nickname').value = person.Nickname || '';
        document.getElementById('edit-bsfamily').value = person.BSFamily || 'None';
        document.getElementById('edit-ministry').value = person.Ministry || 'None';
        document.getElementById('edit-contactnumber').value = person.ContactNumber || '';
        document.getElementById('edit-birthdate').value = person.Birthdate ? person.Birthdate.toISOString().split('T')[0] : '';
        document.getElementById('edit-countryaddress').value = person.CountryAddress || '';
        document.getElementById('edit-ksaaddress').value = person.KSAAddress || '';
        document.getElementById('edit-company').value = person.Company || '';
        document.getElementById('edit-jobposition').value = person.JobPosition || '';
        document.getElementById('edit-firstworshipdate').value = person.FirstWorshipDate ? person.FirstWorshipDate.toISOString().split('T')[0] : '';
        document.getElementById('edit-baptizeddate').value = person.BaptizedDate ? person.BaptizedDate.toISOString().split('T')[0] : '';
        document.getElementById('edit-remarks').value = person.Remarks || '';
        $('#editModal').modal('show');
    }
}

function updatePerson() {
    if (!db) {
        console.error("Cannot update person: Firestore db is not initialized");
        showError("Failed to update person. Database not initialized.");
        return;
    }
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const nickname = document.getElementById('edit-nickname').value.trim();
    const bsFamily = document.getElementById('edit-bsfamily').value;
    const ministry = document.getElementById('edit-ministry').value;
    const contactNumber = document.getElementById('edit-contactnumber').value.trim();
    const birthdate = document.getElementById('edit-birthdate').value;
    const countryAddress = document.getElementById('edit-countryaddress').value.trim();
    const ksaAddress = document.getElementById('edit-ksaaddress').value.trim();
    const company = document.getElementById('edit-company').value.trim();
    const jobPosition = document.getElementById('edit-jobposition').value.trim();
    const firstWorshipDate = document.getElementById('edit-firstworshipdate').value;
    const baptizedDate = document.getElementById('edit-baptizeddate').value;
    const remarks = document.getElementById('edit-remarks').value.trim();
    document.getElementById('edit-name-error').innerText = '';
    document.getElementById('edit-bsfamily-error').innerText = '';
    document.getElementById('edit-ministry-error').innerText = '';
    document.getElementById('edit-contactnumber-error').innerText = '';
    if (!name) {
        document.getElementById('edit-name-error').innerText = 'Name is required';
        return;
    }
    if (!bsFamily) {
        document.getElementById('edit-bsfamily-error').innerText = 'BS Family is required';
        return;
    }
    if (!ministry) {
        document.getElementById('edit-ministry-error').innerText = 'Ministry is required';
        return;
    }
    if (contactNumber && !/^\+?\d{10,15}$/.test(contactNumber)) {
        document.getElementById('edit-contactnumber-error').innerText = 'Invalid phone number';
        return;
    }
    const person = {
        Name: name.toLowerCase(),
        DisplayName: name,
        Nickname: nickname,
        BSFamily: bsFamily,
        Ministry: ministry,
        ContactNumber: contactNumber,
        Birthdate: birthdate ? new Date(birthdate) : null,
        CountryAddress: countryAddress,
        KSAAddress: ksaAddress,
        Company: company,
        JobPosition: jobPosition,
        FirstWorshipDate: firstWorshipDate ? new Date(firstWorshipDate) : null,
        BaptizedDate: baptizedDate ? new Date(baptizedDate) : null,
        Remarks: remarks
    };
    db.collection('people').doc(id).update(person).then(() => {
        $('#editModal').modal('hide');
        document.getElementById('edit-name-error').innerText = '';
        document.getElementById('edit-bsfamily-error').innerText = '';
        document.getElementById('edit-ministry-error').innerText = '';
        document.getElementById('edit-contactnumber-error').innerText = '';
        loadPeople();
        showSuccess("Person updated successfully!");
    }).catch(error => {
        console.error("Error updating person:", error);
        showError("Failed to update person.");
    });
}

function openDeleteEvent(id) {
    document.getElementById('delete-event-id').value = id;
    $('#deleteEventModal').modal('show');
}

// Delete event listener is attached below

function openDetail(id) {
    alert('Detail view for ID: ' + id);
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
    const successCard = document.getElementById('success-card');
    const successMessage = document.getElementById('success-message');
    if (successCard && successMessage) {
        successMessage.innerText = message;
        successCard.classList.remove('d-none');
        successCard.classList.remove('border-success');
        successCard.classList.add('border-danger');
        successCard.querySelector('.card-title').classList.remove('text-success');
        successCard.querySelector('.card-title').classList.add('text-danger');
        successCard.querySelector('.card-title').innerText = 'Error!';
        setTimeout(() => {
            successCard.classList.add('d-none');
            successCard.classList.remove('border-danger');
            successCard.classList.add('border-success');
            successCard.querySelector('.card-title').classList.remove('text-danger');
            successCard.querySelector('.card-title').classList.add('text-success');
            successCard.querySelector('.card-title').innerText = 'Success!';
        }, 5000);
    } else {
        console.error("Success card or message element not found");
        alert(message); // Fallback to alert if card not found
    }
}

// Add null checks before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            searchTerm = document.getElementById('search-term').value;
            currentPage = 1;
            loadPeople();
        });
    }
    const sortName = document.getElementById('sort-name');
    if (sortName) {
        sortName.addEventListener('click', (e) => {
            e.preventDefault();
            sortOrder = sortOrder === 'name_asc' ? 'name_desc' : 'name_asc';
            loadPeople();
        });
    }
    const confirmDelete = document.getElementById('confirm-delete');
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function () {
            const id = document.getElementById('delete-event-id').value;
            db.collection('people').doc(id).delete().then(() => {
                $('#deleteEventModal').modal('hide');
                loadPeople();
                showSuccess("Records deleted successfully!");
            }).catch(error => {
                console.error("Error deleting record:", error);
                showError("Failed to delete record. Please try again.");
            });
        });
    }
    // Export to Excel
    const exportBtn = document.getElementById('exportBtnMaster');
    if (exportBtn) {
        const newExportBtn = exportBtn.cloneNode(true);
        exportBtn.parentNode.replaceChild(newExportBtn, exportBtn);
        newExportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (people.length === 0) {
                showError('No data to export.');
                return;
            }
            function formatDateForExport(date) {
                if (!date) return '';
                if (!(date instanceof Date)) date = new Date(date);
                if (isNaN(date)) return '';
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }
            const exportData = people.map(person => {
                const displayName = person.DisplayName || person.Name || '';
                return {
                    'NAME': displayName,
                    'NICKNAME': person.Nickname || '',
                    'BS FAMILY': person.BSFamily || '',
                    'MINISTRY': person.Ministry || '',
                    'CONTACT NO.': person.ContactNumber || '',
                    'Birthdate': formatDateForExport(person.Birthdate),
                    'COUNTRY ADDRESS': person.CountryAddress || '',
                    'KSA ADDRESS': person.KSAAddress || '',
                    'COMPANY': person.Company || '',
                    'JOB Position': person.JobPosition || '',
                    '1ST WORSHIP DATE': formatDateForExport(person.FirstWorshipDate),
                    'BAPTIZED DATE': formatDateForExport(person.BaptizedDate),
                    'REMARKS': person.Remarks || ''
                };
            });
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wscols = [
                {wch: 30},
                {wch: 15},
                {wch: 20},
                {wch: 20},
                {wch: 15},
                {wch: 12},
                {wch: 30},
                {wch: 30},
                {wch: 20},
                {wch: 20},
                {wch: 12},
                {wch: 12},
                {wch: 30}
            ];
            ws['!cols'] = wscols;
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "People List");
            const fileName = `People_List_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
        });
    }
});

// Import Excel File
document.importExcel = function importExcel() {
    const fileInput = document.getElementById('excelFile');
    const feedback = document.getElementById('import-feedback');
    const importBtn = document.getElementById('importBtn');
    if (feedback) { feedback.style.display = 'none'; feedback.innerText = ''; }
    if (importBtn) { importBtn.disabled = true; importBtn.innerText = 'Importing...'; }
    const file = fileInput.files[0];
    if (!file) {
        if (feedback) { feedback.innerText = 'Please select a file to import.'; feedback.style.display = 'block'; }
        if (importBtn) { importBtn.disabled = false; importBtn.innerText = 'Import'; }
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            if (typeof XLSX === 'undefined') {
                if (feedback) { feedback.innerText = 'Excel library not loaded. Please refresh the page.'; feedback.style.display = 'block'; }
                if (importBtn) { importBtn.disabled = false; importBtn.innerText = 'Import'; }
                return;
            }
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            if (jsonData.length === 0) {
                if (feedback) { feedback.innerText = 'No data found in the Excel file.'; feedback.style.display = 'block'; }
                if (importBtn) { importBtn.disabled = false; importBtn.innerText = 'Import'; }
                return;
            }
            function parseDDMMYYYY(val) {
                if (!val) return null;
                if (val instanceof Date) return val;
                if (typeof val === 'number') return new Date(val);
                if (typeof val === 'string') {
                    let parts = val.split(/[\/\-]/);
                    if (parts.length === 3) {
                        if (isNaN(parts[1])) {
                            const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
                            const monthIndex = months.indexOf(parts[1].toLowerCase().substring(0,3));
                            if (monthIndex !== -1) {
                                let year = parts[2];
                                if (year.length === 2) {
                                    const yr = parseInt(year, 10);
                                    year = (yr < 50 ? 2000 + yr : 1900 + yr).toString();
                                }
                                return new Date(parseInt(year, 10), monthIndex, parseInt(parts[0], 10));
                            }
                        } else {
                            return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
                        }
                    }
                    const d = new Date(val);
                    if (!isNaN(d)) return d;
                }
                return null;
            }
            function logExcelHeadersAndSampleRow(jsonData) {
                if (!jsonData || jsonData.length === 0) {
                    console.warn('Excel import: No data found.');
                    return;
                }
                const headers = Object.keys(jsonData[0]);
                console.log('Excel Detected Headers:', headers);
                console.log('Excel First Row Sample:', jsonData[0]);
            }
            logExcelHeadersAndSampleRow(jsonData);
            const importPromises = jsonData.map(row => {
                function safeField(val, fallback = 'N/A') {
                    return (val && val.toString().trim() !== '') ? val.toString() : fallback;
                }
                const person = {
                    Name: safeField(row['NAME']),
                    DisplayName: safeField(row['NAME']),
                    Nickname: safeField(row['NICKNAME']),
                    BSFamily: safeField(row['BS FAMILY'], 'None'),
                    Ministry: safeField(row['MINISTRY'], 'None'),
                    ContactNumber: safeField(row['CONTACT NO.']),
                    Birthdate: parseDDMMYYYY(row['Birthdate']),
                    CountryAddress: safeField(row['COUNTRY ADDRESS']),
                    KSAAddress: safeField(row['KSA ADDRESS']),
                    Company: safeField(row['COMPANY']),
                    JobPosition: safeField(row['JOB Position']),
                    FirstWorshipDate: parseDDMMYYYY(row['1ST WORSHIP DATE']),
                    BaptizedDate: parseDDMMYYYY(row['BAPTIZED DATE']),
                    Remarks: safeField(row['REMARKS'])
                };
                return db.collection('people').add(person);
            });
            Promise.all(importPromises)
                .then(() => {
                    $('#importModal').modal('hide');
                    fileInput.value = '';
                    loadPeople();
                    showSuccess(`Successfully imported ${jsonData.length} records!`);
                })
                .catch(error => {
                    if (feedback) { feedback.innerText = 'Failed to import some records. Please check the data format.'; feedback.style.display = 'block'; }
                });
        } catch (error) {
            if (feedback) { feedback.innerText = 'Error processing the Excel file. Please check the file format.'; feedback.style.display = 'block'; }
        }
        if (importBtn) { importBtn.disabled = false; importBtn.innerText = 'Import'; }
    };
    reader.onerror = function() {
        if (feedback) { feedback.innerText = 'Error reading the file.'; feedback.style.display = 'block'; }
        if (importBtn) { importBtn.disabled = false; importBtn.innerText = 'Import'; }
    };
    reader.readAsArrayBuffer(file);
}; 