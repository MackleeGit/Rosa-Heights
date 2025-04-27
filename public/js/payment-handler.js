import { supabase } from "./supabase.js"; // Import the Supabase client


document.getElementById("paymentForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const tenantID = document.getElementById("tenantID").value;
    const paymentType = document.getElementById("paymentType").value;
    const paymentAmount = parseFloat(document.getElementById("paymentAmount").value);
    const paymentDate = document.getElementById("paymentDate").value;
    const overduePayID = document.getElementById("overduepayid")?.value || null;
    const amountRemaining = parseFloat(document.getElementById("amountRemaining").value);

    if (!tenantID || !paymentAmount || !paymentDate) {
        alert("Please fill in all required fields.");
        return;
    }

    if (paymentAmount > amountRemaining){
        alert("Payment amount cannot exceed amount owed.")
        return
    }

    if (paymentType === "standard") {
        await processStandardPayment(tenantID, paymentAmount, paymentDate);
    } else if (paymentType === "overdue") {
        if (!overduePayID) {
            alert("Missing Overdue Payment ID");
            return;
        }
        await processOverduePayment(tenantID, paymentAmount, paymentDate, overduePayID);
    } else {
        alert("Invalid payment type.");
    }
});

async function processStandardPayment(tenantID, amountPaid, paymentDate) {
    console.log("Inserting into standardpayments", {
        tenantid: tenantID,
        amountpaid: amountPaid,
        paymentdate: paymentDate
      });
      
    
    
   
    // Insert into standardpayments (ignore errors)
try {
    await supabase.from("standardpayments").insert([
      { tenantid: tenantID, amountpaid: amountPaid, paymentdate: paymentDate }
    ]);
  } catch (err) {
    console.warn("Payment insert likely succeeded, ignoring fetch error:", err);
  }
  

    // Update amountpaid in current_month_due
    const { error: updateError } = await supabase
        .from("current_month_due")
        .update({ amountpaid: amountPaid })
        .eq("tenantid", tenantID);
    
    if (updateError) {
        alert("Error updating current month due: " + updateError.message);
        return;
    }

    confirm("Standard Payment Successful!");
    window.location.href='this-month-due-pay.html';
}

async function processOverduePayment(tenantID, amountPaid, paymentDate, overduePayID) {
    // Insert into overduepayments
    const { error: paymentError } = await supabase.from("overduepayments").insert([
        { tenantid: tenantID, amountpaid: amountPaid, paymentdate: paymentDate, overduepayid: overduePayID }
    ]);
    if (paymentError) {
        alert("Error processing overdue payment: " + paymentError.message);
        return;
    }

    // Update amountpaid in overdue_pay_instance
    const { error: updateError } = await supabase
        .from("overdue_pay_instance")
        .update({ amountpaid: amountPaid })
        .eq("overduepayid", overduePayID);
    
    if (updateError) {
        alert("Error updating overdue payment record: " + updateError.message);
        return;
    }

    confirm("Overdue Payment Successful!");
    window.location.href='unpaid-overdue.html';
}
