"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/dashboard" });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="YNAB" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1>YNAB</h1>
          <p>You Need A Budget — Welcome back!</p>
        </div>

        <button className="btn btn-google" onClick={handleGoogle}>
          <i className="fab fa-google" style={{ color: "#EA4335" }}></i>
          Continue with Google
        </button>

        <div className="divider"><span>or sign in with email</span></div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#DC2626", fontSize: "14px" }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "8px" }}></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link href="/forgot-password" style={{ color: "var(--pacific-cyan)", fontSize: "13px", textDecoration: "none", fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner"></span> : <><i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In</>}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link href="/signup">Create one free</Link>
        </div>
      </div>
    </div>
  );
}
