import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import {
  getDatabase,
  ref,
  set,
  remove,
  onValue,
  off,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDVcc0-uhxSFFgXUBW1Fjh8F_CFWuoAzGA",
  authDomain: "kiit-smartbus-ff329.firebaseapp.com",
  databaseURL: "https://kiit-smartbus-ff329-default-rtdb.firebaseio.com",
  projectId: "kiit-smartbus-ff329",
  storageBucket: "kiit-smartbus-ff329.firebasestorage.app",
  messagingSenderId: "479430905856",
  appId: "1:479430905856:web:174f7688249147256a08e5",
  measurementId: "G-TC6JW02DM0",
};

const app       = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const rtdb = getDatabase(app);

// ─── FIXED ADMIN CREDENTIALS ─────────────────────────────────────────────────
export const ADMIN_EMAIL    = "Admin1@kiit.ac.in";
export const ADMIN_PASSWORD = "Admin1@123";
export const ADMIN_NAME     = "Admin1";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export async function registerUser({ name, email, password, role, vehicle, vehicleType }) {
  // Block anyone trying to register as admin
  if (role === "admin") throw new Error("Admin registration is not allowed.");

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid  = cred.user.uid;

  const userData = { uid, name, email, role };
  if (role === "driver") {
    userData.vehicle     = vehicle;
    userData.vehicleType = vehicleType;
  }

  await setDoc(doc(db, "users", uid), userData);

  if (role === "driver") {
    await setDoc(doc(db, "buses", vehicle), {
      id:          vehicle,
      driverId:    uid,
      driverName:  name,
      driverEmail: email,
      vehicleType,
      destination: "c1",
      status:      "Empty",
      active:      false,
      approved:    false,
      lat:         20.3537 + (Math.random() - 0.5) * 0.006,
      lng:         85.8185 + (Math.random() - 0.5) * 0.006,
      lastUpdate:  Date.now(),
    });
  }

  return { uid, ...userData };
}

export async function loginUser(email, password) {
  // Fixed admin login — no Firestore lookup needed
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return { uid: "admin-fixed", name: ADMIN_NAME, email: ADMIN_EMAIL, role: "admin" };
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  if (!snap.exists()) throw new Error("User profile not found");
  return { uid: cred.user.uid, ...snap.data() };
}

export async function logoutUser() {
  try { await signOut(auth); } catch (_) {}
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) { callback(null); return; }
    const snap = await getDoc(doc(db, "users", user.uid));
    callback(snap.exists() ? { uid: user.uid, ...snap.data() } : null);
  });
}

// ─── BUSES ────────────────────────────────────────────────────────────────────
export async function getAllBuses() {
  const snap = await getDocs(collection(db, "buses"));
  return snap.docs.map(d => d.data());
}

export async function getBus(vehicleId) {
  const snap = await getDoc(doc(db, "buses", vehicleId));
  return snap.exists() ? snap.data() : null;
}

export async function approveDriver(vehicleId) {
  await updateDoc(doc(db, "buses", vehicleId), { approved: true });
}

export async function rejectDriver(vehicleId, driverId) {
  // Delete bus doc and user doc so they can re-register cleanly
  await deleteDoc(doc(db, "buses", vehicleId));
  if (driverId) await deleteDoc(doc(db, "users", driverId));
  // Also remove GPS entry
  try { await remove(ref(rtdb, `gps/${vehicleId}`)); } catch (_) {}
}

export async function removeDriver(vehicleId, driverId) {
  // Permanently delete bus + user docs + GPS
  await deleteDoc(doc(db, "buses", vehicleId));
  if (driverId) await deleteDoc(doc(db, "users", driverId));
  try { await remove(ref(rtdb, `gps/${vehicleId}`)); } catch (_) {}
}

export async function assignDestination(vehicleId, destId) {
  await updateDoc(doc(db, "buses", vehicleId), {
    destination: destId,
    lastUpdate:  Date.now(),
  });
}

export async function updateBusStatus(vehicleId, status) {
  await updateDoc(doc(db, "buses", vehicleId), { status, lastUpdate: Date.now() });
}

export async function setBusActive(vehicleId, active) {
  await updateDoc(doc(db, "buses", vehicleId), { active, lastUpdate: Date.now() });
}

export function listenBuses(callback) {
  return onSnapshot(collection(db, "buses"), snap => {
    callback(snap.docs.map(d => d.data()));
  });
}

// ─── GPS ──────────────────────────────────────────────────────────────────────
export async function pushDriverLocation(vehicleId, lat, lng) {
  await set(ref(rtdb, `gps/${vehicleId}`), { lat, lng, ts: Date.now() });
}

export function listenAllGPS(callback) {
  const r = ref(rtdb, "gps");
  onValue(r, snap => callback(snap.val() || {}));
  return () => off(r);
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => d.data());
}
