import { supabase } from "../js/supabase.js"; // Import Supabase client

document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("#tenants-table tbody");
    const deleteButton = document.querySelector("#delete-btn");

    // Fetch Tenants from Supabase
    async function fetchTenants() {
        const { data: tenants, error } = await supabase.from("tenants").select("*");
        if (error) {
            console.error("Error fetching tenants:", error);
            return;
        }

        tableBody.innerHTML = ""; // Clear table before inserting new rows

        tenants.forEach((tenant) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="checkbox" class="delete-checkbox" data-id="${tenant.tenantid}"></td>
                <td>${tenant.tenantid}</td>
                <td>${tenant.firstname}</td>
                <td>${tenant.lastname}</td>
                <td>${tenant.house}</td>
                <td>${tenant.phone}</td>
                <td>${tenant.rent_per_month}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    await fetchTenants();

    // Delete Selected Tenants
    deleteButton.addEventListener("click", async () => {
        const selectedTenants = Array.from(document.querySelectorAll(".delete-checkbox:checked"))
            .map((checkbox) => checkbox.dataset.id);

        if (selectedTenants.length === 0) {
            alert("No tenants selected for deletion.");
            return;
        }

        const confirmDelete = confirm("Are you sure you want to delete the selected tenants?");
        if (!confirmDelete) return;

        for (let tenantId of selectedTenants) {
            const { error } = await supabase.from("tenants").delete().eq("tenantid", tenantId);
            if (error) {
                console.error(`Error deleting tenant ${tenantId}:`, error);
            }
        }

        alert("Tenant records successfully deleted.");
        window.location.href = "view-tenants.html"; // Redirect after successful deletion
    });
});
