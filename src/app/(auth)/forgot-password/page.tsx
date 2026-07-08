"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="YNAB" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1>YNAB</h1>
          <p>Reset your password</p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: 48, color: "var(--pacific-cyan)", marginBottom: 16 }}></i>
            <h3 style={{ color: "var(--midnight-violet)", marginBottom: 8 }}>Check your inbox</h3>
            <p style={{ color: "var(--gray-400)", fontSize: 14 }}>
              If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.
            </p>
            <div style={{ marginTop: 24 }}>
              <Link href="/login" className="btn btn-primary" style={{ display: "inline-flex" }}>
                <i className="fa-solid fa-arrow-left"></i> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p style={{ color: "var(--gray-400)", fontSize: 14, marginBottom: 24, textAlign: "center" }}>
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner"></span> : <><i className="fa-solid fa-paper-plane"></i> Send Reset Link</>}
              </button>
            </form>
            <div className="auth-footer">
              <Link href="/login">← Back to Sign In</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
