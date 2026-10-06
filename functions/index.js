const {
  setGlobalOptions
} = require("firebase-functions");

const {
  onCall,
  HttpsError
} = require("firebase-functions/v2/https");

const {
  initializeApp
} = require("firebase-admin/app");

const {
  getFirestore,
  FieldValue
} = require("firebase-admin/firestore");


// ========================================
// 1. INITIALIZE FIREBASE ADMIN
// ========================================

initializeApp();


// ========================================
// 2. GLOBAL SETTINGS
// ========================================

setGlobalOptions({
  maxInstances: 10
});


// ========================================
// 3. TEST BACKEND CONNECTION
// ========================================

exports.testConnection = onCall(
  {
    region: "us-central1"
  },
  async (request) => {

    return {

      success: true,

      message:
        "Madad backend is connected successfully",

      authenticated:
        request.auth != null

    };

  }
);


// ========================================
// 4. CREATE USER PROFILE
// ========================================

exports.createUserProfile = onCall(
  {
    region: "us-central1"
  },
  async (request) => {

    // ========================================
    // CHECK AUTHENTICATION
    // ========================================

    if (!request.auth) {

      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to create a profile."
      );

    }


    // ========================================
    // GET DATA FROM VUE APPLICATION
    // ========================================

    const data =
      request.data || {};

    const uid =
      request.auth.uid;

    const name =
      typeof data.name === "string"
        ? data.name.trim()
        : "";

    const company =
      typeof data.company === "string"
        ? data.company.trim()
        : "";

    const requestedRole =
      data.role === "admin"
        ? "admin"
        : "user";

    const adminCode =
      typeof data.adminCode === "string"
        ? data.adminCode.trim()
        : "";


    // ========================================
    // GET VERIFIED EMAIL FROM FIREBASE AUTH
    // ========================================

    const email =
      request.auth.token.email || "";


    // ========================================
    // VALIDATION
    // ========================================

    if (!name) {

      throw new HttpsError(
        "invalid-argument",
        "Name is required."
      );

    }


    if (!company) {

      throw new HttpsError(
        "invalid-argument",
        "Company is required."
      );

    }


    if (!email) {

      throw new HttpsError(
        "invalid-argument",
        "The authenticated account has no email address."
      );

    }


    // ========================================
    // DETERMINE USER ROLE
    // ========================================

    let role = "user";


    if (requestedRole === "admin") {

      /*
       * DEMO / DEVELOPMENT ONLY
       *
       * Replace this with Secret Manager
       * before production.
       */

      const correctAdminCode =
        "MADAD-ADMIN-2026";


      if (adminCode !== correctAdminCode) {

        throw new HttpsError(
          "permission-denied",
          "Invalid admin registration code."
        );

      }


      role = "admin";

    }


    // ========================================
    // CONNECT TO FIRESTORE
    // ========================================

    const db =
      getFirestore();


    const userRef =
      db
        .collection("users")
        .doc(uid);


    // ========================================
    // CHECK IF PROFILE ALREADY EXISTS
    // ========================================

    const existingProfile =
      await userRef.get();


    if (existingProfile.exists) {

      throw new HttpsError(
        "already-exists",
        "A Madad profile already exists for this account."
      );

    }


    // ========================================
    // CREATE FIRESTORE USER PROFILE
    // ========================================

    await userRef.set({

      uid: uid,

      name: name,

      email: email,

      company: company,

      role: role,

      active: true,

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp()

    });


    // ========================================
    // SERVER LOG
    // ========================================

    console.log(
      `Madad profile created for ${uid} with role ${role}`
    );


    // ========================================
    // SEND RESULT BACK TO VUE
    // ========================================

    return {

      success: true,

      message:
        "Madad account profile created successfully.",

      uid: uid,

      role: role

    };

  }
);