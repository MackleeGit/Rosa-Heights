import { supabase } from "../js/supabase.js"; // Import Supabase client

// Auto-fill TenantID from URL params
const urlParams = new URLSearchParams(window.location.search);
const tenantID = urlParams.get("tenantID");
document.getElementById("tenantID").value = tenantID || "N/A";

const form = document.getElementById("paymentForm");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const amountPaid = parseFloat(document.getElementById("amountPaid").value);
    const paymentDate = document.getElementById("paymentDate").value;

    if (!tenantID) {
        alert("Error: Tenant ID is missing.");
        return;
    }

    // Fetch tenant's financial details
    const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("rent")
        .eq("tenantid", tenantID)
        .single();

    if (tenantError || !tenant) {
        alert("Error fetching tenant details.");
        console.error(tenantError);
        return;
    }

    const { data: dueData, error: dueError } = await supabase
        .from("current_month_due")
        .select("amountpaid, waterbill, garbagebill")
        .eq("tenantid", tenantID)
        .single();

    if (dueError || !dueData) {
        alert("Error fetching current month due.");
        console.error(dueError);
        return;
    }

    const totalOwed = tenant.rent + dueData.waterbill + dueData.garbagebill;
    const remainingBalance = totalOwed - dueData.amountpaid;

    if (amountPaid > remainingBalance) {
        errorMessage.textContent = `Payment cannot exceed amount owed ($${remainingBalance.toFixed(2)}).`;
        errorMessage.style.display = "block";
        return;
    }

    // Update current_month_due table
    const newAmountPaid = dueData.amountpaid + amountPaid;

    const { error: updateError } = await supabase
        .from("current_month_due")
        .update({ amountpaid: newAmountPaid })
        .eq("tenantid", tenantID);

    if (updateError) {
        alert("Error updating payment record.");
        console.error(updateError);
        return;
    }

    alert("Payment recorded successfully.");
    window.location.href = "view-tenants.html";
});
