import { supabase } from "../js/supabase.js";

// Fetch payment records from both tables, merge them, and fetch tenant details.
async function fetchPaymentRecords() {
    try {
        console.log("Fetching payment records...");

        // Fetch records from standardpayments and overduepayments
        let { data: standardPayments, error: standardError } = await supabase
            .from('standardpayments')
            .select('*');
        if (standardError) throw standardError;

        let { data: overduePayments, error: overdueError } = await supabase
            .from('overduepayments')
            .select('*');
        if (overdueError) throw overdueError;

        // Tag records with their payment type
        standardPayments = standardPayments.map(record => ({ ...record, paymentType: 'standard' }));
        overduePayments = overduePayments.map(record => ({ ...record, paymentType: 'overdue' }));

        // Combine all payment records
        const allPayments = [...standardPayments, ...overduePayments];

        // For each record, fetch tenant info (firstname, lastname, house) from tenants table
        const paymentsWithTenant = await Promise.all(allPayments.map(async (record) => {
            const { data: tenantData, error: tenantError } = await supabase
                .from('tenants')
                .select('firstname, lastname, house')
                .eq('tenantid', record.tenantid)
                .single();
            if (tenantError) {
                console.error("Error fetching tenant for tenantid", record.tenantid, tenantError);
                return record; // fallback: return record without tenant info
            }
            return { ...record, ...tenantData };
        }));

        // Optionally, compute "For Which Month" from the paymentdate (displayed as e.g., "Jan 2025")
        paymentsWithTenant.forEach(record => {
            const date = new Date(record.paymentdate);
            const options = { month: 'short', year: 'numeric' };
            record.forWhichMonth = date.toLocaleDateString(undefined, options);
        });

        // Store records globally for filtering/sorting
        window.allPaymentRecords = paymentsWithTenant;

        displayPaymentRecords(paymentsWithTenant);
    } catch (error) {
        console.error("Error fetching payment records:", error);
    }
}

// Display the payment records in the table
function displayPaymentRecords(records) {
    const tableBody = document.querySelector("#payment-records-table tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    records.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${record.paymentid || ""}</td>
            <td>${record.tenantid || ""}</td>
            <td>${record.firstname || ""}</td>
            <td>${record.lastname || ""}</td>
            <td>${record.house || ""}</td>
            <td>${record.amountpaid || ""}</td>
            <td>${record.paymentType}</td>
            <td>${record.forWhichMonth || ""}</td>
            <td>${record.paymentdate || ""}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Search filter function
function filterPaymentTable() {
    const searchValue = document.getElementById("search-bar").value.toLowerCase();
    const tableRows = document.querySelectorAll("#payment-records-table tbody tr");

    tableRows.forEach((row) => {
        const rowText = row.textContent.toLowerCase();
        row.style.display = rowText.includes(searchValue) ? "" : "none";
    });
}


document.addEventListener("DOMContentLoaded", () => {
    fetchPaymentRecords();
    document.getElementById("search-bar").addEventListener("input", filterPaymentTable);
});

