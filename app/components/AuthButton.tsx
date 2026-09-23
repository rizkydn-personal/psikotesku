"use client";
import { LogIn, LogOut } from "lucide-react";
import { useApp } from "./Providers";
export default function AuthButton() {
  const { user, loading, login, logout } = useApp();
  return (
    <button
      className="btn text-xs sm:text-sm"
      disabled={loading}
      onClick={user ? logout : login}
    >
      {user ? <LogOut size={16} /> : <LogIn size={16} />}
      <span>{loading ? "Memuat…" : user ? "Keluar" : "Masuk Google"}</span>
    </button>
  );
}
