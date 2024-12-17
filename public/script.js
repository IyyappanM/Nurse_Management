let nursesData = []; 
let currentSortField = '';
let currentSortOrder = 'asc'; // Toggle between 'asc' and 'desc'

// Fetch and display nurses
async function fetchNurses(search = '') {
    const response = await fetch(`/api/nurses?search=${search}`);
    nursesData = await response.json(); // Save fetched data
    displayTable(nursesData);
}

// Display nurses data in table
function displayTable(data) {
    const tableBody = document.querySelector('#nurse-table tbody');
    tableBody.innerHTML = ''; // for Clearing previous table rows

    // Add data rows dynamically
    data.forEach(nurse => {
        const row = `
            <tr>
                <td>${nurse.id}</td>
                <td>${nurse.name}</td>
                <td>${nurse.license_number}</td>
                <td>${new Date(nurse.dob).toLocaleDateString()}</td>
                <td>${nurse.age}</td>
                <td>
                    <button onclick="deleteNurse(${nurse.id})" class="btn btn-danger btn-sm">Remove</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    // Adding input row at the bottom
    const inputRow = `
        <tr>
            <td></td>
            <td><input type="text" id="name-input" class="form-control" placeholder=""></td>
            <td><input type="text" id="license-input" class="form-control" placeholder=""></td>
            <td><input type="date" id="dob-input" class="form-control"></td>
            <td><input type="number" id="age-input" class="form-control" placeholder=""></td>
            <td>
                <button id="add-btn" class="btn btn-primary">Add Row</button>
            </td>
        </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', inputRow);

    document.getElementById('add-btn').addEventListener('click', addNurseFromRow);
}

// th Sorting table data
function sortTable(field) {
    if (currentSortField === field) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortField = field;
        currentSortOrder = 'asc';
    }

    // Sort logic
    nursesData.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        // Convert to proper data types for sorting
        if (field === 'dob') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        } else if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        } else {
            valA = Number(valA);
            valB = Number(valB);
        }

        return currentSortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    updateSortIcons(field);
    displayTable(nursesData);
}

// Update sorting icons
function updateSortIcons(activeField) {
    const fields = ['id', 'name', 'license_number', 'dob', 'age'];
    fields.forEach(field => {
        const icon = document.getElementById(`${field}-sort-icon`);
        if (field === activeField) {
            icon.textContent = currentSortOrder === 'asc' ? '↑' : '↓';
        } else {
            icon.textContent = '⇅'; // Reset icons for other fields
        }
    });
}

// Add new nurse
async function addNurseFromRow() {
    const name = document.getElementById('name-input').value.trim();
    const license_number = document.getElementById('license-input').value.trim();
    const dob = document.getElementById('dob-input').value;
    const age = document.getElementById('age-input').value.trim();

    if (!name || !license_number || !dob || !age) {
        alert('Please fill all fields!');
        return;
    }

    const response = await fetch('/api/nurses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, license_number, dob, age })
    });

    if (response.ok) {
        alert('Nurse added successfully!');
        fetchNurses();
    } else {
        alert('Error adding nurse. Please try again.');
    }
}

// for Deleting nurse details
async function deleteNurse(id) {
    const response = await fetch(`/api/nurses/${id}`, { method: 'DELETE' });
    if (response.ok) {
        alert('Nurse removed successfully!');
        fetchNurses();
    } else {
        alert('Error deleting nurse. Please try again.');
    }
}

// download nurses data in Excel
function downloadExcel() {
    if (nursesData.length === 0) {
        alert('No data available to download.');
        return;
    }

    // Convert data to SheetJS-compatible format
    const formattedData = nursesData.map(nurse => ({
        ID: nurse.id,
        Name: nurse.name,
        'License Number': nurse.license_number,
        'Date of Birth': new Date(nurse.dob).toLocaleDateString(),
        Age: nurse.age
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nurses Data');

    // Trigger file download
    XLSX.writeFile(workbook, 'nurses_data.xlsx');
}

// Search event listener
document.getElementById('search-input').addEventListener('input', (event) => {
    const search = event.target.value;
    fetchNurses(search);
});

// Add event listener for download button
document.getElementById('download-btn').addEventListener('click', downloadExcel);

// Initial fetch
fetchNurses();
