import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { firebaseConfig } from "./env.js"; // 👈

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

console.log("🔥 Firebase Initialized:", { app, db });
export { db };




console.log("Firebase initialized:", { app, db })
// Export Firebase components
export { db };

    // Log Firebase app initialization details to the console
  console.log("Firebase App:", app);
 
  