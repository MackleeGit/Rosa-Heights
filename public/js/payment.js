document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);

    console.log("Received Params:", Object.fromEntries(params.entries())); // Debugging

    document.getElementById("tenantID").value = params.get("tenantID") || "";
    document.getElementById("firstName").value = params.get("firstName") || "";
    document.getElementById("lastName").value = params.get("lastName") || "";
    document.getElementById("house").value = params.get("house") || "";
    document.getElementById("amountRemaining").value = params.get("amountRemaining") || "0";
    document.getElementById("paymentType").value = params.get("type") || "standard";

    // Set overduepayid if applicable
    const overduepayid = params.get("overduepayid");
    if (overduepayid) {
        document.getElementById("overduepayid").value = overduepayid;
    }

    // Auto-fill date
    document.getElementById("paymentDate").value = new Date().toISOString().split('T')[0];
});

