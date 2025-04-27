import { supabase } from "./supabase.js"; // Import the Supabase client

// Select the form element
const tenantForm = document.getElementById("tenantForm");

// Prevent form from reloading and handle data submission
tenantForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form behavior

    // Collect form data
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const house = document.getElementById("house").value.trim();
    const rent = parseFloat(document.getElementById("rent").value);

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !house || isNaN(rent) || rent <= 0) {
        alert("Please fill in all fields correctly.");
        return;
    }

    try {
        // Insert tenant into the "Tenants" table
        const { data, error } = await supabase.from("tenants").insert([
            {
                firstname: firstName,
                lastname: lastName,
                email: email,
                phone: phone,
                house: house,
                rent: rent
            }
        ]);

        if (error) throw error;

        console.log("Tenant added:", data);

        if (confirm("New Tenant Successfully Added! Click OK to continue.")) {
            window.location.href = "view-tenants.html";
        }
        
    } catch (error) {
        console.error("Error adding tenant:", error.message);
        alert("Failed to add tenant. Please try again.");
    }
});
