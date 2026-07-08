"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <i className="fa-solid fa-circle-check" style={{ fontSize: 48, color: "var(--success)", marginBottom: 16 }}></i>
        <h3 style={{ color: "var(--midnight-violet)", marginBottom: 8 }}>Password Updated!</h3>
        <p style={{ color: "var(--gray-400)", fontSize: 14, marginBottom: 24 }}>You can now sign in with your new password.</p>
        <Link href="/login" className="btn btn-primary" style={{ display: "inline-flex" }}>
          <i className="fa-solid fa-arrow-right-to-bracket"></i> Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#DC2626", fontSize: "14px" }}>{error}</div>}
      <div className="form-group">
        <label>New Password</label>
        <input type="password" className="form-control" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Confirm New Password</label>
        <input type="password" className="form-control" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <span className="spinner"></span> : <><i className="fa-solid fa-lock"></i> Update Password</>}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="YNAB" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1>YNAB</h1>
          <p>Set a new password</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
