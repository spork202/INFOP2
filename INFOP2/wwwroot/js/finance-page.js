// finance-page.js
// All logic moved from Finance.cshtml inline script

// Use global variables injected from Razor
const firebaseConfig = window.firebaseConfig;
let currentPage = window.currentPage;
const pageSize = window.pageSize;
let sortOrder = window.sortOrder;
let searchTerm = window.searchTerm;

let db = null;
let transactions = [];
let totalItems = 0;
let totalPages = 0;
let financeChart;
let trendsChart;
let categoryChart;

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

// Load Transactions on page load
window.onload = function () {
    loadTransactions();
};

// Load Transactions from Firestore
function loadTransactions() {
    let query = db.collection('transactions');
    if (searchTerm) {
        query = query.where('Description', '>=', searchTerm.toLowerCase())
                     .where('Description', '<=', searchTerm.toLowerCase() + '\uf8ff');
    }
    query.get().then(snapshot => {
        transactions = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            transactions.push({
                Id: doc.id,
                Description: data.DisplayDescription,
                Amount: data.Amount,
                Category: data.Category,
                Date: data.Date ? new Date(data.Date.seconds * 1000) : null,
                Notes: data.Notes || ''
            });
        });
        // Sort
        if (sortOrder === 'description_desc') {
            transactions.sort((a, b) => {
                const descA = a.Description || '';
                const descB = b.Description || '';
                return descB.localeCompare(descA);
            });
        } else {
            transactions.sort((a, b) => {
                const descA = a.Description || '';
                const descB = b.Description || '';
                return descA.localeCompare(descB);
            });
        }
        totalItems = transactions.length;
        totalPages = Math.ceil(totalItems / pageSize);
        currentPage = Math.max(1, Math.min(currentPage, totalPages));
        renderTable();
        updatePagination();
        updateSummary();
        updateAllCharts();
        if (transactions.length === 0) {
            document.getElementById('no-data').classList.remove('d-none');
        } else {
            document.getElementById('no-data').classList.add('d-none');
        }
    }).catch(error => {
        console.error("Error loading transactions:", error);
        document.getElementById('table-container').style.display = 'none';
        document.getElementById('no-data').innerHTML = '<p class="text-danger">Failed to load transactions. Please try again later.</p>';
        document.getElementById('no-data').style.display = 'block';
    });
}

// Render Table
function renderTable() {
    const tbody = document.getElementById('transaction-table-body');
    tbody.innerHTML = '';
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, transactions.length);
    for (let i = start; i < end; i++) {
        const transaction = transactions[i];
        const row = `
            <tr>
                <td>${transaction.Description}</td>
                <td>${transaction.Amount.toFixed(2)}</td>
                <td><span class="badge px-3 py-2 ${transaction.Category === 'Income' ? 'bg-success' : 'bg-danger'}">${transaction.Category}</span></td>
                <td>${transaction.Date ? transaction.Date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''}</td>
                <td>${transaction.Notes}</td>
                <td>
                    <button class="btn btn-sm btn-warning" data-bs-tooltop="tooltip" title="Edit" onclick="openEdit('${transaction.Id}')"><i class="fa-solid fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" data-bs-tooltop="tooltip" title="Delete" onclick="openDeleteEvent('${transaction.Id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    }
}

// Update Summary
function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;
    transactions.forEach(transaction => {
        if (transaction.Category === 'Income') {
            totalIncome += transaction.Amount;
        } else if (transaction.Category === 'Expense') {
            totalExpenses += transaction.Amount;
        }
    });
    const netBalance = totalIncome - totalExpenses;
    document.getElementById('total-income').innerText = totalIncome.toFixed(2);
    document.getElementById('total-expenses').innerText = totalExpenses.toFixed(2);
    document.getElementById('net-balance').innerText = netBalance.toFixed(2);
    document.getElementById('net-balance').parentElement.className = netBalance >= 0 ? 'text-success' : 'text-danger';
    updateMonthlyAverages();
}

// Calculate and Update Monthly Averages
function updateMonthlyAverages() {
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    for (let month = 0; month < 12; month++) {
        const monthKey = `${currentYear}-${month + 1}`;
        monthlyData[monthKey] = { income: 0, expenses: 0, hasTransactions: false };
    }
    transactions.forEach(transaction => {
        if (transaction.Date) {
            const year = transaction.Date.getFullYear();
            const month = transaction.Date.getMonth() + 1;
            const monthKey = `${year}-${month}`;
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].hasTransactions = true;
                if (transaction.Category === 'Income') {
                    monthlyData[monthKey].income += transaction.Amount;
                } else if (transaction.Category === 'Expense') {
                    monthlyData[monthKey].expenses += transaction.Amount;
                }
            }
        }
    });
    let totalMonthsWithTransactions = 0;
    let totalMonthlyIncome = 0;
    let totalMonthlyExpenses = 0;
    Object.values(monthlyData).forEach(monthData => {
        if (monthData.hasTransactions) {
            totalMonthsWithTransactions++;
            totalMonthlyIncome += monthData.income;
            totalMonthlyExpenses += monthData.expenses;
        }
    });
    const avgMonthlyIncome = totalMonthsWithTransactions > 0 ? totalMonthlyIncome / totalMonthsWithTransactions : 0;
    const avgMonthlyExpenses = totalMonthsWithTransactions > 0 ? totalMonthlyExpenses / totalMonthsWithTransactions : 0;
    document.getElementById('avg-monthly-income').innerText = avgMonthlyIncome.toFixed(2);
    document.getElementById('avg-monthly-expenses').innerText = avgMonthlyExpenses.toFixed(2);
}

// Update all charts
function updateAllCharts() {
    updateFinanceChart();
    updateTrendsChart();
    updateCategoryChart();
}

// Update Finance Chart
function updateFinanceChart() {
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    for (let month = 0; month < 12; month++) {
        const monthKey = `${currentYear}-${month + 1}`;
        monthlyData[monthKey] = { income: 0, expenses: 0 };
    }
    transactions.forEach(transaction => {
        if (transaction.Date) {
            const year = transaction.Date.getFullYear();
            const month = transaction.Date.getMonth() + 1;
            const monthKey = `${year}-${month}`;
            if (monthlyData[monthKey]) {
                if (transaction.Category === 'Income') {
                    monthlyData[monthKey].income += transaction.Amount;
                } else if (transaction.Category === 'Expense') {
                    monthlyData[monthKey].expenses += transaction.Amount;
                }
            }
        }
    });
    const labels = Object.keys(monthlyData).map(key => {
        const [year, month] = key.split('-');
        return new Date(year, month - 1).toLocaleString('default', { month: 'short' });
    });
    const incomeData = Object.values(monthlyData).map(data => data.income);
    const expensesData = Object.values(monthlyData).map(data => data.expenses);
    if (financeChart) {
        financeChart.destroy();
    }
    const ctx = document.getElementById('financeChart').getContext('2d');
    financeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(40, 167, 69, 0.6)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    backgroundColor: 'rgba(220, 53, 69, 0.6)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Amount' } },
                x: { title: { display: true, text: 'Month' } }
            },
            plugins: { legend: { position: 'top' } }
        }
    });
}

// Update Trends Chart
function updateTrendsChart() {
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, new Date().getMonth() - i, 1);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = { income: 0, expenses: 0, net: 0 };
    }
    transactions.forEach(transaction => {
        if (transaction.Date) {
            const date = transaction.Date;
            const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            if (monthlyData[monthKey]) {
                if (transaction.Category === 'Income') {
                    monthlyData[monthKey].income += transaction.Amount;
                } else if (transaction.Category === 'Expense') {
                    monthlyData[monthKey].expenses += transaction.Amount;
                }
                monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expenses;
            }
        }
    });
    const labels = Object.keys(monthlyData).reverse();
    const incomeData = labels.map(key => monthlyData[key].income);
    const expensesData = labels.map(key => monthlyData[key].expenses);
    const netData = labels.map(key => monthlyData[key].net);
    if (trendsChart) {
        trendsChart.destroy();
    }
    const ctx = document.getElementById('trendsChart').getContext('2d');
    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    borderColor: 'rgba(220, 53, 69, 1)',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Net',
                    data: netData,
                    borderColor: 'rgba(13, 110, 253, 1)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Amount' } },
                x: { title: { display: true, text: 'Month' } }
            },
            plugins: { legend: { position: 'top' } }
        }
    });
}

// Update Category Chart
function updateCategoryChart() {
    const categoryData = {
        Income: { total: 0, count: 0 },
        Expense: { total: 0, count: 0 }
    };
    transactions.forEach(transaction => {
        if (transaction.Category in categoryData) {
            categoryData[transaction.Category].total += transaction.Amount;
            categoryData[transaction.Category].count++;
        }
    });
    const labels = Object.keys(categoryData);
    const data = labels.map(category => categoryData[category].total);
    const counts = labels.map(category => categoryData[category].count);
    if (categoryChart) {
        categoryChart.destroy();
    }
    const ctx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const count = counts[context.dataIndex];
                            return `${label}: $${value.toFixed(2)} (${count} transactions)`;
                        }
                    }
                }
            }
        }
    });
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

// Add Transaction
function addTransaction() {
    const description = document.getElementById('add-description').value;
    const amount = parseFloat(document.getElementById('add-amount').value);
    const category = document.getElementById('add-category').value;
    const date = document.getElementById('add-date').value;
    const notes = document.getElementById('add-notes').value;
    if (!description) {
        document.getElementById('add-description-error').innerText = 'Description is required';
        return;
    }
    if (!amount || amount <= 0) {
        document.getElementById('add-amount-error').innerText = 'Amount must be greater than 0';
        return;
    }
    const transaction = {
        Description: description.toLowerCase(),
        DisplayDescription: description,
        Amount: amount,
        Category: category,
        Date: date ? new Date(date) : null,
        Notes: notes,
        userId: null // Placeholder for no authentication
    };
    db.collection('transactions').add(transaction).then(() => {
        $('#addModal').modal('hide');
        loadTransactions();
    }).catch(error => {
        console.error("Error adding transaction:", error);
        alert("Failed to add transaction. Please try again.");
    });
}

// Open Edit Modal
function openEdit(id) {
    const transaction = transactions.find(t => t.Id === id);
    if (transaction) {
        document.getElementById('edit-id').value = transaction.Id;
        document.getElementById('edit-description').value = transaction.Description;
        document.getElementById('edit-amount').value = transaction.Amount;
        document.getElementById('edit-category').value = transaction.Category;
        document.getElementById('edit-date').value = transaction.Date ? transaction.Date.toISOString().split('T')[0] : '';
        document.getElementById('edit-notes').value = transaction.Notes;
        $('#editModal').modal('show');
    }
}

// Update Transaction
function updateTransaction() {
    const id = document.getElementById('edit-id').value;
    const description = document.getElementById('edit-description').value;
    const amount = parseFloat(document.getElementById('edit-amount').value);
    const category = document.getElementById('edit-category').value;
    const date = document.getElementById('edit-date').value;
    const notes = document.getElementById('edit-notes').value;
    if (!description) {
        document.getElementById('edit-description-error').innerText = 'Description is required';
        return;
    }
    if (!amount || amount <= 0) {
        document.getElementById('edit-amount-error').innerText = 'Amount must be greater than 0';
        return;
    }
    const transaction = {
        Description: description.toLowerCase(),
        DisplayDescription: description,
        Amount: amount,
        Category: category,
        Date: date ? new Date(date) : null,
        Notes: notes,
        userId: null // Placeholder for no authentication
    };
    db.collection('transactions').doc(id).update(transaction).then(() => {
        $('#editModal').modal('hide');
        loadTransactions();
    }).catch(error => {
        console.error("Error updating transaction:", error);
        alert("Failed to update transaction. Please try again.");
    });
}

// Open Delete Event Modal
function openDeleteEvent(id) {
    document.getElementById('delete-event-id').value = id;
    $('#deleteEventModal').modal('show');
}

// Delete Transaction
document.getElementById('confirm-delete').addEventListener('click', function () {
    const id = document.getElementById('delete-event-id').value;
    db.collection('transactions').doc(id).delete().then(() => {
        $('#deleteEventModal').modal('hide');
        loadTransactions();
        showSuccess("Transaction deleted successfully!");
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

// Search Handler
document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    searchTerm = document.getElementById('search-term').value;
    currentPage = 1;
    window.location.href = `/Finance?CurrentPage=${currentPage}&SearchTerm=${searchTerm}&SortOrder=${sortOrder}`;
});

// Sort Handler
document.getElementById('sort-description').addEventListener('click', (e) => {
    e.preventDefault();
    sortOrder = sortOrder === 'description_asc' ? 'description_desc' : 'description_asc';
    window.location.href = `/Finance?CurrentPage=${currentPage}&SearchTerm=${searchTerm}&SortOrder=${sortOrder}`;
}); 