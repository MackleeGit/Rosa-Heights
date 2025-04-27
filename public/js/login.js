import { supabase } from "../js/supabase.js"; // Ensure correct path

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent page reload

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  console.log("🔹 Attempting login for:", email);

  // ✅ Use Supabase authentication (DO NOT manually query "users" table)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error("❌ Login failed:", error.message);
    alert("Login failed: " + error.message);
    return;
  }

  // ✅ Login successful → Redirect to dashboard
  if (data.user) {
    if (confirm("✅ Login successful! Click OK to proceed.")) {
      window.location.href = "../templates/caretaker-dashboard.html";
    }
  }
});
