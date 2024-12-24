// Import necessary Firebase functions and database references
import { db } from "../js/firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    const tenantsTable = document.getElementById("tenants-table").getElementsByTagName("tbody")[0];
    const tenantsRef = ref(db, "Tenants");

    onValue(tenantsRef, (snapshot) => {
        tenantsTable.innerHTML = ""; // Clear existing rows
        const data = snapshot.val();

        if (data) {
            for (const key in data) {
                const tenant = data[key];
                const row = tenantsTable.insertRow();

                row.innerHTML = `
                    <td>${tenant.TenantID || ""}</td>
                    <td>${tenant.FirstName || ""}</td>
                    <td>${tenant.LastName || ""}</td>
                    <td>${tenant.House || ""}</td>
                    <td>${tenant.Rent || ""}</td>
                    <td>${tenant.Phone || ""}</td>
                `;
            }
        } else {
            tenantsTable.innerHTML = "<tr><td colspan='6'>No tenants found.</td></tr>";
        }
    });
});

// Search and filter functionality
function filterTable() {
    const input = document.getElementById("search-bar").value.toLowerCase();
    const table = document.getElementById("tenants-table");
    const rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let match = false;

        for (let j = 0; j < cells.length; j++) {
            if (cells[j].innerText.toLowerCase().includes(input)) {
                match = true;
                break;
            }
        }

        rows[i].style.display = match ? "" : "none";
    }
}

document.getElementById("search-bar").addEventListener("input", filterTable);