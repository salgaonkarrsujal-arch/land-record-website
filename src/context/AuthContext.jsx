import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getRedirectResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithRedirect,
  updateProfile as updateFirebaseProfile,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { get, ref, set, update } from "firebase/database";
import { auth, database, getSecondaryAuth, isFirebaseConfigured } from "../lib/firebase";

const AuthContext = createContext(null);

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const mainAdminEmail = String(import.meta.env.VITE_MAIN_ADMIN_EMAIL || "")
  .trim()
  .toLowerCase();

function isAdminRole(role) {
  return role === "admin" || role === "main_admin";
}

function resolveRole(email, storedRole = "user") {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (normalizedEmail && normalizedEmail === mainAdminEmail) {
    return "main_admin";
  }

  if (storedRole === "main_admin") {
    return mainAdminEmail ? "user" : "main_admin";
  }

  if (storedRole === "admin") {
    return "admin";
  }

  if (normalizedEmail && adminEmails.includes(normalizedEmail)) {
    return "admin";
  }

  return "user";
}

function isProfileComplete(profile) {
  if (!profile) {
    return false;
  }

  if (isAdminRole(profile.role)) {
    return true;
  }

  return Boolean(
    profile.displayName &&
      profile.phoneNumber &&
      profile.office &&
      profile.designation &&
      profile.adminWork &&
      profile.workType
  );
}

function isMobileBrowser() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function normalizeUserProfile(firebaseUser, role = "user", extra = {}) {
  const nextProfile = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || extra.displayName || "",
    email: firebaseUser.email || extra.email || "",
    phoneNumber: firebaseUser.phoneNumber || extra.phoneNumber || "",
    role,
    providerId: firebaseUser.providerData?.[0]?.providerId || "custom",
    office: extra.office || "",
    designation: extra.designation || "",
    adminWork: extra.adminWork || "",
    workType: extra.workType || "",
    remarks: extra.remarks || "",
    updatedAt: new Date().toISOString()
  };

  return {
    ...nextProfile,
    profileComplete: isProfileComplete(nextProfile)
  };
}

async function upsertUserProfile(firebaseUser, role = "user", extra = {}) {
  if (!database) {
    return { ...normalizeUserProfile(firebaseUser, role, extra), createdAt: null };
  }

  const userRef = ref(database, `users/${firebaseUser.uid}`);
  const snapshot = await get(userRef);
  const base = normalizeUserProfile(firebaseUser, role, extra);
  const existing = snapshot.exists() ? snapshot.val() : null;
  const resolvedRole = resolveRole(
    base.email || existing?.email || extra.email,
    existing?.role || role || "user"
  );
  const nextProfile = existing
    ? {
        ...existing,
        uid: firebaseUser.uid,
        displayName: base.displayName || existing.displayName || "",
        email: base.email || existing.email || "",
        phoneNumber: base.phoneNumber || existing.phoneNumber || "",
        role: resolvedRole,
        providerId: base.providerId || existing.providerId || "custom",
        office: extra.office ?? existing.office ?? "",
        designation: extra.designation ?? existing.designation ?? "",
        adminWork: extra.adminWork ?? existing.adminWork ?? "",
        workType: extra.workType ?? existing.workType ?? "",
        remarks: extra.remarks ?? existing.remarks ?? "",
        updatedAt: base.updatedAt
      }
    : {
        ...base,
        role: resolvedRole,
        createdAt: new Date().toISOString()
      };

  nextProfile.profileComplete = isProfileComplete(nextProfile);

  if (existing) {
    await update(userRef, nextProfile);
  } else {
    await set(userRef, nextProfile);
  }

  return { uid: firebaseUser.uid, ...nextProfile };
}

async function findUserProfileByEmail(email) {
  if (!database || !email) {
    return null;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const snapshot = await get(ref(database, "users"));

  if (!snapshot.exists()) {
    return null;
  }

  const users = Object.values(snapshot.val());
  return (
    users.find((item) => String(item.email || "").trim().toLowerCase() === normalizedEmail) || null
  );
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [adminOtpConfirmation, setAdminOtpConfirmation] = useState(null);
  const [adminOtpVerified, setAdminOtpVerified] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};

    async function initializeAuth() {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error("Failed to set auth persistence", error);
      }

      try {
        const redirectResult = await getRedirectResult(auth);

        if (redirectResult?.user) {
          const role = resolveRole(redirectResult.user.email);
          const userProfile = await upsertUserProfile(redirectResult.user, role);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Google redirect sign-in failed", error);
      }

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setCurrentUser(firebaseUser);

        if (!firebaseUser) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const emailRole = resolveRole(firebaseUser.email);
        const userProfile = await upsertUserProfile(firebaseUser, emailRole);

        setProfile(userProfile);
        setLoading(false);
      });
    }

    initializeAuth();

    return () => unsubscribe();
  }, []);

  const ensureConfigured = () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase is not configured yet. Add the Vite Firebase env values first.");
    }
  };

  const signInWithGoogleUser = async () => {
    ensureConfigured();
    const provider = new GoogleAuthProvider();

    if (isMobileBrowser()) {
      await signInWithRedirect(auth, provider);
      return null;
    }

    const result = await signInWithPopup(auth, provider);
    const role = resolveRole(result.user.email);
    const userProfile = await upsertUserProfile(result.user, role);
    setProfile(userProfile);
    return result.user;
  };

  const signInUser = async (email, password) => {
    ensureConfigured();
    const result = await signInWithEmailAndPassword(auth, email, password);
    const role = resolveRole(email);
    const userProfile = await upsertUserProfile(result.user, role, { email });
    setProfile(userProfile);
    return result.user;
  };

  const signUpUser = async ({ email, password, displayName }) => {
    ensureConfigured();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const userProfile = await upsertUserProfile(result.user, "user", {
      email,
      displayName
    });
    setProfile(userProfile);
    return result.user;
  };

  const resetUserPassword = async (email) => {
    ensureConfigured();
    await sendPasswordResetEmail(auth, email);
  };

  const setupPhoneVerifier = (containerId = "phone-recaptcha") => {
    ensureConfigured();
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "normal"
    });

    return window.recaptchaVerifier;
  };

  const startPhoneLogin = async (phoneNumber, containerId = "phone-recaptcha") => {
    ensureConfigured();
    const verifier = setupPhoneVerifier(containerId);
    const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    setConfirmationResult(result);
    return result;
  };

  const verifyPhoneOtp = async (otpCode) => {
    if (!confirmationResult) {
      throw new Error("Request an OTP first.");
    }

    const result = await confirmationResult.confirm(otpCode);
    const userProfile = await upsertUserProfile(result.user, "user");
    setProfile(userProfile);
    setConfirmationResult(null);
    return result.user;
  };

  const startAdminOtp = async (phoneNumber, containerId = "admin-phone-recaptcha") => {
    ensureConfigured();

    if (!phoneNumber) {
      throw new Error("Main admin phone number is missing. Add it in the profile first.");
    }

    const secondaryAuth = getSecondaryAuth("main-admin-otp");

    if (!secondaryAuth) {
      throw new Error("Secondary Firebase auth is not available.");
    }

    if (window.adminRecaptchaVerifier) {
      window.adminRecaptchaVerifier.clear();
    }

    const verifier = new RecaptchaVerifier(secondaryAuth, containerId, {
      size: "normal"
    });

    window.adminRecaptchaVerifier = verifier;
    await verifier.render();

    const result = await signInWithPhoneNumber(secondaryAuth, phoneNumber, verifier);
    setAdminOtpConfirmation(result);
    setAdminOtpVerified(false);
    return result;
  };

  const verifyAdminOtp = async (otpCode) => {
    if (!adminOtpConfirmation) {
      throw new Error("Request the OTP first.");
    }

    const secondaryAuth = getSecondaryAuth("main-admin-otp");
    const result = await adminOtpConfirmation.confirm(otpCode);

    if (secondaryAuth) {
      await signOut(secondaryAuth);
    }

    if (window.adminRecaptchaVerifier) {
      window.adminRecaptchaVerifier.clear();
      window.adminRecaptchaVerifier = null;
    }

    setAdminOtpConfirmation(null);
    setAdminOtpVerified(true);
    return result.user;
  };

  const resetAdminOtpVerification = () => {
    if (window.adminRecaptchaVerifier) {
      window.adminRecaptchaVerifier.clear();
      window.adminRecaptchaVerifier = null;
    }

    setAdminOtpConfirmation(null);
    setAdminOtpVerified(false);
  };

  const verifyMainAdminPassword = async (currentPassword) => {
    ensureConfigured();

    if (!auth.currentUser || profile?.role !== "main_admin") {
      throw new Error("Only the main admin can verify this action.");
    }

    if (!currentPassword) {
      throw new Error("Enter the main admin password.");
    }

    if (!auth.currentUser.email) {
      throw new Error("Main admin email is missing for verification.");
    }

    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    setAdminOtpVerified(true);
    return true;
  };

  const signInAdmin = async (email, password) => {
    ensureConfigured();
    const result = await signInWithEmailAndPassword(auth, email, password);
    const databaseProfile = await findUserProfileByEmail(email);
    const resolvedRole = resolveRole(email, databaseProfile?.role || "user");

    if (!isAdminRole(resolvedRole)) {
      await signOut(auth);
      throw new Error("This account is not allowed to access admin features.");
    }

    const userProfile = await upsertUserProfile(result.user, resolvedRole, { email, ...databaseProfile });
    setProfile(userProfile);
    return result.user;
  };

  const createAdminUser = async ({ email, password }) => {
    ensureConfigured();

    if (!auth.currentUser || profile?.role !== "main_admin") {
      throw new Error("Only the main admin can create admin users.");
    }

    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new Error("Enter admin email and password.");
    }

    if (normalizedEmail === mainAdminEmail) {
      throw new Error("This email is already reserved as the main admin.");
    }

    const existingProfile = await findUserProfileByEmail(normalizedEmail);

    if (existingProfile?.role === "admin" || existingProfile?.role === "main_admin") {
      throw new Error("This email already has admin access.");
    }

    if (existingProfile?.uid) {
      const updatedAt = new Date().toISOString();

      await update(ref(database, `users/${existingProfile.uid}`), {
        role: "admin",
        designation: existingProfile.designation || "Admin",
        workType: existingProfile.workType || "Admin Access",
        profileComplete: true,
        updatedAt
      });

      return {
        uid: existingProfile.uid,
        email: normalizedEmail,
        promotedExistingUser: true
      };
    }

    const secondaryAuth = getSecondaryAuth();

    if (!secondaryAuth) {
      throw new Error("Secondary Firebase auth is not available.");
    }

    const created = await createUserWithEmailAndPassword(secondaryAuth, normalizedEmail, password);
    const displayName = normalizedEmail.split("@")[0].replace(/[._-]+/g, " ");
    const createdAt = new Date().toISOString();

    await set(ref(database, `users/${created.user.uid}`), {
      uid: created.user.uid,
      displayName: displayName
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      email: normalizedEmail,
      phoneNumber: "",
      role: "admin",
      providerId: "password",
      office: "",
      designation: "Admin",
      adminWork: "",
      workType: "Admin Access",
      remarks: "",
      profileComplete: true,
      createdAt,
      updatedAt: createdAt
    });

    await signOut(secondaryAuth);
    return created.user;
  };

  const logout = async () => {
    ensureConfigured();
    await signOut(auth);
    setProfile(null);
    setCurrentUser(null);
  };

  const saveProfile = async (updates) => {
    ensureConfigured();

    if (!auth.currentUser) {
      throw new Error("You need to be signed in to update your profile.");
    }

    const nextDisplayName = updates.displayName ?? profile?.displayName ?? auth.currentUser.displayName ?? "";

    if (nextDisplayName !== auth.currentUser.displayName) {
      await updateFirebaseProfile(auth.currentUser, { displayName: nextDisplayName });
    }

    const mergedProfile = await upsertUserProfile(auth.currentUser, profile?.role || "user", {
      ...profile,
      ...updates,
      displayName: nextDisplayName
    });

    setProfile(mergedProfile);
    return mergedProfile;
  };

  const value = useMemo(
    () => ({
      currentUser,
      profile,
      loading,
      isAuthenticated: Boolean(currentUser),
      isAdmin: isAdminRole(profile?.role),
      isMainAdmin: profile?.role === "main_admin",
      isProfileComplete: Boolean(profile?.profileComplete),
      confirmationResult,
      adminOtpVerified,
      isFirebaseConfigured,
      signInWithGoogleUser,
      signInUser,
      signUpUser,
      resetUserPassword,
      startPhoneLogin,
      verifyPhoneOtp,
      startAdminOtp,
      verifyAdminOtp,
      verifyMainAdminPassword,
      resetAdminOtpVerification,
      signInAdmin,
      createAdminUser,
      saveProfile,
      logout
    }),
    [adminOtpVerified, confirmationResult, currentUser, loading, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
