import { supabase } from "../js/supabase.js"; // Import Supabase client
console.log("We're live");
// Function to fetch and display monthly dues
async function fetchMonthlyDues() {
    try {
        // Fetch dues
        const { data: dues, error: dueError } = await supabase
            .from('current_month_due')
            .select('tenantid, waterbill, garbagebill, amountpaid, monthdue, waterbillset');

        if (dueError) throw dueError;

        const tableBody = document.querySelector("#due-pay-table tbody");
        tableBody.innerHTML = ""; // Clear old data

        for (let due of dues) {
            // Fetch tenant info
            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .select('firstname, lastname, house, rent')
                .eq('tenantid', due.tenantid)
                .single();

            if (tenantError) throw tenantError;

            // Compute amounts
            const totalBill = (due.waterbillset ? due.waterbill : 0) + (due.garbagebill || 0) + (tenant.rent || 0);
            const amountRemaining = totalBill - (due.amountpaid || 0);
            const paymentStatus = amountRemaining === 0
                ? '<span style="color: green; font-weight: bold;">PAYMENT COMPLETED</span>'
                : `<a class="init-payment" href="payment.html">Handle Client Payment</a>`;

            // Water Bill Column: Show value or "Set Water Bill" button
            const waterBillCell = due.waterbillset
                ? `${due.waterbill}`
                : `<button class="set-waterbill-btn" data-tenantid="${due.tenantid}">Set Water Bill</button>`;

            // Insert row
            tableBody.innerHTML += `
    <tr>
        <td class="tenant-id">${due.tenantid}</td>
        <td class="first-name">${tenant.firstname}</td>
        <td class="last-name">${tenant.lastname}</td>
        <td class="house">${tenant.house}</td>
        <td>${tenant.rent}</td>
        <td>${due.garbagebill}</td>
        <td>${waterBillCell}</td>
        <td>${totalBill}</td>
        <td>${due.amountpaid}</td>
        <td class="amount-remaining">${amountRemaining}</td>
        <td>${paymentStatus}</td>
      
    </tr>`;
        }

        // Attach event listeners to "Set Water Bill" buttons
        document.querySelectorAll('.set-waterbill-btn').forEach(button => {
            button.addEventListener('click', () => {
                const tenantId = button.dataset.tenantid;
                setWaterBill(tenantId);
            });
        });

    } catch (error) {
        console.error("Error fetching dues:", error);
    }
}

// Function to set water bill
async function setWaterBill(tenantId) {
    const waterBillAmount = prompt("Enter water bill amount:");
    if (!waterBillAmount) return;

    const { error } = await supabase
        .from('current_month_due')
        .update({ waterbill: waterBillAmount, waterbillset: true })
        .eq('tenantid', tenantId);

    if (error) {
        console.error("Error updating water bill:", error);
        alert("Failed to update water bill.");
    } else {
        alert("Water bill updated successfully!");
        fetchMonthlyDues(); // Refresh the table
    }
}

// Function to move overdue payments to 'overdue_pay_instance' and clear 'current_month_due'
async function moveOverduePayments() {
    try {
        // Fetch all dues from 'current_month_due'
        const { data: dues, error: dueError } = await supabase.from('current_month_due').select(`
    *,
    tenant:tenantid (rent)
  `);

        if (dueError) throw dueError;

        const unpaidDues = dues.filter((due) => {
            const totalBill = (due.waterbillset ? due.waterbill : 0) + (due.garbagebill || 0) + (due.tenant?.rent || 0);
            const amountRemaining = totalBill - (due.amountpaid || 0);
            return amountRemaining > 0;
        });

        if (unpaidDues.length === 0) {
            alert("No unpaid dues to process.");
            return;
        }


        // Map data for insertion into 'overdue_pay_instance'
        const overdueDataArr = unpaidDues.map(due => ({
            tenantid: due.tenantid,
            waterbill: Number(due.waterbill) || 0,
            garbagebill: Number(due.garbagebill) || 0,
            amountpaidbydelay: Number(due.amountpaid) || 0,
            amountpaid: Number(due.amountpaid) || 0,
            monthdue: due.monthdue
        }));

        // Insert into 'overdue_pay_instance'
        const { error: insertError } = await supabase.from('overdue_pay_instance').insert(overdueDataArr);
        if (insertError) throw insertError;

        alert("Overdue payments moved successfully!");

        // 🔥 Safely clear 'current_month_due' AFTER insertion
        await clearCurrentMonthDue();

    } catch (error) {
        console.error("Error moving overdue payments:", error);
        alert("Failed to move overdue payments. Check console for details.");
    }
}

// Separate function to safely clear 'current_month_due'
async function clearCurrentMonthDue() {
    try {
        // Ensure deletion runs safely with valid condition
        const { error: deleteError } = await supabase
            .from('current_month_due')
            .delete()
            .gte('tenantid', 0); // ✅ Only delete where tenantid is a valid integer (≥ 0)

        if (deleteError) throw deleteError;

        alert("Current month dues cleared!");
        fetchMonthlyDues(); // Refresh table after clearing
    } catch (error) {
        console.error("Error clearing current month dues:", error);
        alert("Failed to clear current month dues.");
    }
}


// Function to restart a new payment batch (only if 'current_month_due' is empty)
async function restartNewPaymentBatch() {
    try {
        // Check if 'current_month_due' is empty
        const { data: existingDues, error: checkError } = await supabase.from('current_month_due').select('tenantid');
        if (checkError) throw checkError;

        if (existingDues.length > 0) {
            alert("Cannot restart a new batch while 'current_month_due' is not empty. Move overdue payments first.");
            return;
        }

        // Ask user for the payment month
        const newMonthDue = prompt("Enter the new payment month (e.g., 'Jan 2025'):");
        if (!newMonthDue) return;

        // Check if the month already exists in 'overdue_pay_instance'
        const { data: overdueRecords, error: overdueCheckError } = await supabase
            .from('overdue_pay_instance')
            .select('monthdue')
            .eq('monthdue', newMonthDue);

        if (overdueCheckError) throw overdueCheckError;

        if (overdueRecords.length > 0) {
            if (!confirm(`Records for ${newMonthDue} already exist in overdue payments. Proceed?`)) {
                return;
            }
        }

        // Fetch all tenants
        const { data: tenants, error: tenantError } = await supabase.from('tenants').select('tenantid');
        if (tenantError) throw tenantError;

        // Create new records in 'current_month_due'
        const newDues = tenants.map(tenant => ({
            tenantid: tenant.tenantid,
            waterbill: 0,
            garbagebill: 200,
            amountpaid: 0,
            waterbillset: false,
            monthdue: newMonthDue
        }));

        // Insert new records
        const { error: insertError } = await supabase.from('current_month_due').insert(newDues);
        if (insertError) throw insertError;

        alert(`New payment batch for ${newMonthDue} has been created successfully!`);
        fetchMonthlyDues(); // Refresh the table
    } catch (error) {
        console.error("Error restarting payment batch:", error);
        alert("Failed to restart new payment batch. Check console for details.");
    }
}

// Attach event listeners to new buttons
document.getElementById("move-overdue-btn").addEventListener("click", moveOverduePayments);
document.getElementById("restart-payment-btn").addEventListener("click", restartNewPaymentBatch);
document.addEventListener("DOMContentLoaded", fetchMonthlyDues);


// Attach event listener to the table instead of individual buttons
document.querySelector("#due-pay-table tbody").addEventListener("click", (event) => {
    if (event.target.classList.contains("init-payment")) {
        event.preventDefault(); // Stop any default behavior
        const row = event.target.closest("tr"); // Get the clicked row

        // Extract values from table row
        const tenantID = row.querySelector(".tenant-id")?.innerText.trim();
        const firstName = row.querySelector(".first-name")?.innerText.trim();
        const lastName = row.querySelector(".last-name")?.innerText.trim();
        const house = row.querySelector(".house")?.innerText.trim();
        const amountRemaining = row.querySelector(".amount-remaining")?.innerText.trim();
        const type = window.location.pathname.includes("unpaid-overdue.html") ? "overdue" : "standard";


        const url = `payment.html?tenantID=${encodeURIComponent(tenantID)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&house=${encodeURIComponent(house)}&amountRemaining=${encodeURIComponent(amountRemaining)}&type=${type}`;

        console.log("Redirecting to:", url);
        window.location.href = url; // Perform redirection

    }
});


function filterTable() {
    const searchValue = document.getElementById("search-bar").value.toLowerCase();
    const tableRows = document.querySelectorAll("#due-pay-table tbody tr");
    console.log("Filtering rows:", tableRows.length, "searching for:", searchValue);

    tableRows.forEach((row) => {
        const rowText = row.textContent.toLowerCase();
        row.style.display = rowText.includes(searchValue) ? "" : "none";
    });
}

// Hook it up on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("search-bar").addEventListener("input", filterTable);
});
