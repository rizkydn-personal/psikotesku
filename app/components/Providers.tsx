"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import type { Result } from "@/lib/psychotest";
import { normalizeDisplayName } from "@/lib/firebaseErrors";
type Context = {
  user: User | null;
  displayName: string;
  changeName: (name: string) => Promise<void>;
  loading: boolean;
  error: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  results: Record<string, Result>;
  keepResult: (r: Result) => void;
};
const AppContext = createContext<Context | null>(null);
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("Provider diperlukan");
  return context;
}
export default function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(!!auth);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Record<string, Result>>({});
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(
      auth,
      (u) => {
        setUser(u);
        setDisplayName(u?.displayName || "");
        setLoading(false);
      },
      () => {
        setError("Sesi login tidak dapat dimuat. Silakan coba lagi.");
        setLoading(false);
      },
    );
  }, []);
  async function login() {
    setError("");
    if (!auth) {
      setError(
        "Login Google belum diaktifkan. Anda tetap dapat mencoba tes sebagai tamu.",
      );
      return;
    }
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setError(
        "Login belum berhasil. Periksa koneksi dan izinkan popup, lalu coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function logout() {
    try {
      if (auth) await signOut(auth);
      setResults({});
    } catch {
      setError("Gagal keluar. Silakan coba lagi.");
    }
  }
  async function changeName(value: string) {
    const current = auth?.currentUser;
    if (!current || current.uid !== user?.uid)
      throw new Error("Masuk kembali untuk mengubah nama.");
    const name = normalizeDisplayName(value);
    await updateProfile(current, { displayName: name });
    if (auth?.currentUser?.uid === current.uid) setDisplayName(name);
  }
  return (
    <AppContext.Provider
      value={{
        user,
        displayName,
        changeName,
        loading,
        error,
        login,
        logout,
        results,
        keepResult: (r) =>
          setResults((previous) => ({ ...previous, [r.id]: r })),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
