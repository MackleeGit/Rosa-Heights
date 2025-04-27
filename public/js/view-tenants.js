import { supabase } from "../js/supabase.js"; // Import Supabase client

// Function to populate the table
async function populateTable() {
    const tableBody = document.querySelector("#tenants-table tbody");
    tableBody.innerHTML = ""; // Clear table before adding new rows

    try {
        // Fetch tenants from Supabase
        const { data: tenants, error } = await supabase.from("tenants").select("*");

        if (error) {
            throw error;
        }

        if (tenants && tenants.length > 0) {
            tenants.forEach((tenant) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${tenant.tenantid || ""}</td>
                    <td>${tenant.firstname || ""}</td>
                    <td>${tenant.lastname || ""}</td>
                    <td>${tenant.house || ""}</td>
                    <td>${tenant.phone || ""}</td>
                    <td>${tenant.rent || ""}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = "<tr><td colspan='6'>No tenants found.</td></tr>";
        }
    } catch (error) {
        console.error("Error fetching tenants:", error.message);
        tableBody.innerHTML = `<tr><td colspan='6'>Failed to load tenants.</td></tr>`;
    }
}

// Function to filter the table based on search input
function filterTable() {
    const searchValue = document.getElementById("search-bar").value.toLowerCase();
    const tableRows = document.querySelectorAll("#tenants-table tbody tr");

    tableRows.forEach((row) => {
        const rowText = row.textContent.toLowerCase();
        row.style.display = rowText.includes(searchValue) ? "" : "none";
    });
}

// Initialize table on page load
window.addEventListener("DOMContentLoaded", populateTable);
window.filterTable = filterTable; // Expose filterTable globally
