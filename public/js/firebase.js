
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
    import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries
  
    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
      apiKey: "AIzaSyBFYOg1Y_QGaB6Ft9HCq9Gjnm9CtDDzZlc",
      authDomain: "rosa-heights.firebaseapp.com",
      databaseURL: "https://rosa-heights-default-rtdb.asia-southeast1.firebasedatabase.app/",
      projectId: "rosa-heights",
      storageBucket: "rosa-heights.firebasestorage.app",
      messagingSenderId: "167195016594",
      appId: "1:167195016594:web:f535511e56469ffdb5d54b",
      measurementId: "G-K2V74M6YV0"
    };
  
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const db = getDatabase(app);






console.log("Firebase initialized:", { app, db })
// Export Firebase components
export { db };

    // Log Firebase app initialization details to the console
  console.log("Firebase App:", app);
 
  