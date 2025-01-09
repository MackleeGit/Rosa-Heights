// Import Firebase components from firebase.js
import { db } from "./firebase.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Select the form element
const tenantForm = document.getElementById("tenantForm");

// Prevent form from reloading and handle data submission
tenantForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form behavior

    // Collect form data
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const house = document.getElementById("house").value;
    const phone = document.getElementById("phone").value;
    const rent = document.getElementById("rent").value;
    const garbageBill = document.getElementById("garbageBill").value;

    // Reference to the tenants in the database
    const tenantsRef = ref(db, "Tenants");

    try {
        // Fetch existing tenants to auto-generate TenantID
        const snapshot = await get(tenantsRef);
        const tenantCount = snapshot.exists() 
            ? Object.keys(snapshot.val()).length + 1 
            : 1; // If no tenants exist yet, start from 1

        // Set the data to Firebase Realtime Database
        await set(ref(db, "Tenants/" + tenantCount), {
            TenantID: tenantCount,
            FirstName: firstName,
            LastName: lastName,
            House: house,
            Phone: phone,
            Rent: rent,
            GarbageBill: garbageBill
        });

        // Redirect first, then show the alert
        window.location.href = "view-tenants.html";

        // Delay alert after redirection
        setTimeout(() => {
            alert("New Tenant Successfully Added!");
        }, 500);

    } catch (error) {
        console.error("Error adding tenant: ", error);
        alert("Failed to add tenant. Please try again.");
    }
});


//Add input validation and dupicate checks here