import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  RecaptchaVerifier,
  onAuthStateChanged,
  setPersistence,
  updateProfile as updateFirebaseProfile,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { get, ref, set, update } from "firebase/database";
import { auth, database, isFirebaseConfigured } from "../lib/firebase";

const AuthContext = createContext(null);

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function normalizeUserProfile(firebaseUser, role = "user", extra = {}) {
  return {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || extra.displayName || "",
    email: firebaseUser.email || extra.email || "",
    phoneNumber: firebaseUser.phoneNumber || extra.phoneNumber || "",
    role,
    providerId: firebaseUser.providerData?.[0]?.providerId || "custom",
    office: extra.office || "",
    designation: extra.designation || "",
    updatedAt: new Date().toISOString()
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
  const nextProfile = existing
    ? {
        ...existing,
        ...base
      }
    : {
        ...base,
        createdAt: new Date().toISOString()
      };

  if (existing) {
    await update(userRef, nextProfile);
  } else {
    await set(userRef, nextProfile);
  }

  return { uid: firebaseUser.uid, ...nextProfile };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

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

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setCurrentUser(firebaseUser);

        if (!firebaseUser) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const emailRole =
          firebaseUser.email && adminEmails.includes(firebaseUser.email.toLowerCase()) ? "admin" : "user";
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
    const result = await signInWithPopup(auth, provider);
    const role = result.user.email && adminEmails.includes(result.user.email.toLowerCase()) ? "admin" : "user";
    const userProfile = await upsertUserProfile(result.user, role);
    setProfile(userProfile);
    return result.user;
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

  const signInAdmin = async (email, password) => {
    ensureConfigured();
    const result = await signInWithEmailAndPassword(auth, email, password);
    const normalizedEmail = email.toLowerCase();

    if (!adminEmails.includes(normalizedEmail)) {
      await signOut(auth);
      throw new Error("This account is not allowed to access admin features.");
    }

    const userProfile = await upsertUserProfile(result.user, "admin", { email });
    setProfile(userProfile);
    return result.user;
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
      isAdmin: profile?.role === "admin",
      confirmationResult,
      isFirebaseConfigured,
      signInWithGoogleUser,
      startPhoneLogin,
      verifyPhoneOtp,
      signInAdmin,
      saveProfile,
      logout
    }),
    [confirmationResult, currentUser, loading, profile]
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
