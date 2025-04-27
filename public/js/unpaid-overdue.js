import { supabase } from "../js/supabase.js"; // Import Supabase client

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('#overdue-table tbody');
    
    // Fetch overdue payments
    const { data: overduePayments, error } = await supabase
        .from('overdue_pay_instance')
        .select('*');

    if (error) {
        console.error('Error fetching overdue payments:', error);
        return;
    }

    // Clear table before inserting new rows
    tableBody.innerHTML = '';

    for (const payment of overduePayments) {
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('firstname, lastname, house, rent')
            .eq('tenantid', payment.tenantid)
            .single();

        if (tenantError) {
            console.error(`Error fetching tenant ${payment.tenantid}:`, tenantError);
            continue;
        }

        // Constants and Calculations
        const garbageFee = payment.garbagebill || 0;
        const waterBill = payment.waterbill || 0;
        const rent = tenant.rent || 0;
        const totalBill = rent + garbageFee + waterBill;
        const amountRemaining = totalBill - payment.amountpaid;

        // Payment Button Logic
        const paymentButton = amountRemaining > 0 
            ? `<a class="init-payment" href="#">Handle Client Payment</a>`
            : `<span style="color: green; font-weight: bold;">PAYMENT COMPLETED</span>`;

        // Insert Row into Table
        tableBody.innerHTML += `
            <tr>
                <td class="unique-id">${payment.overduepayid}</td>
                <td class="tenant-id">${payment.tenantid}</td>
                <td class="firstname">${tenant.firstname}</td>
                <td class="lastname">${tenant.lastname}</td>
                <td class="house">${tenant.house}</td>
                <td>${payment.amountpaidbydelay}</td>
                <td>${payment.monthdue}</td>
                <td>${rent.toFixed(2)}</td>
                <td>${garbageFee.toFixed(2)}</td>
                <td>${waterBill.toFixed(2)}</td>
                <td>${totalBill.toFixed(2)}</td>
                <td>${payment.amountpaid.toFixed(2)}</td>
                <td class="amount-remaining">${amountRemaining.toFixed(2)}</td>
                <td>${paymentButton}</td>
            </tr>
        `;
    }
});



// Function to filter the table based on search input
function filterTable() {
    const searchValue = document.getElementById("search-bar").value.trim().toLowerCase();
    const tableBody = document.querySelector("#overdue-table tbody");

    if (!tableBody) return; // Ensure table exists before proceeding

    const tableRows = tableBody.querySelectorAll("tr");

    tableRows.forEach((row) => {
        const rowText = row.innerText.toLowerCase();
        row.style.display = rowText.includes(searchValue) ? "" : "none";
    });
}

// Attach event listener to the search bar
document.getElementById("search-bar").addEventListener("input", filterTable);



// Use event delegation on the overdue payments table body
document.querySelector("#overdue-table tbody").addEventListener("click", (event) => {
    if (event.target.classList.contains("init-payment")) {
        event.preventDefault(); // Prevent default link behavior

        const row = event.target.closest("tr");
        if (!row) {
            console.error("No row found for the clicked button.");
            return;
        }

        // Extract values from the row cells based on known positions:
        const overduepayid = row.querySelector(".unique-id")?.innerText.trim() || "";
        const tenantID =  row.querySelector(".tenant-id")?.innerText.trim() || "";
        const firstName = row.querySelector(".firstname")?.innerText.trim() || "";
        const lastName =  row.querySelector(".lastname")?.innerText.trim() || "";
        const house =  row.querySelector(".house")?.innerText.trim() || "";
        const amountRemaining = row.querySelector(".amount-remaining")?.innerText.trim() || "";
        const type = "overdue"; // Since we're on the unpaid-overdue page

        // Build the URL including overduepayid
        const url = `payment.html?tenantID=${encodeURIComponent(tenantID)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&house=${encodeURIComponent(house)}&amountRemaining=${encodeURIComponent(amountRemaining)}&type=${encodeURIComponent(type)}&overduepayid=${encodeURIComponent(overduepayid)}`;
        
        console.log("Redirecting to:", url);
        window.location.href = url;
    }
});
