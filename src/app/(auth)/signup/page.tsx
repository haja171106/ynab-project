"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CURRENCIES = [
  { code: "USD", name: "US Dollar ($)" },
  { code: "EUR", name: "Euro (€)" },
  { code: "MGA", name: "Ariary (Ar)" },
  { code: "GBP", name: "British Pound (£)" },
  { code: "JPY", name: "Japanese Yen (¥)" },
  { code: "CAD", name: "Canadian Dollar (C$)" },
  { code: "AUD", name: "Australian Dollar (A$)" },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    phone: "", location: "", currency: "USD",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName) e.firstName = "First name is required";
    if (!form.lastName) e.lastName = "Last name is required";
    if (!form.email) e.email = "Email is required";
    if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrors({ submit: data.error });
      setLoading(false);
      return;
    }

    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/dashboard");
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-logo">
          <img src="/logo.png" alt="YNAB" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1>YNAB</h1>
          <p>Create your free account</p>
        </div>

        <button className="btn btn-google" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
          <i className="fab fa-google" style={{ color: "#EA4335" }}></i>
          Sign up with Google
        </button>

        <div className="divider"><span>or fill in your details</span></div>

        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#DC2626", fontSize: "14px" }}>
              {errors.submit}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input type="text" className={`form-control${errors.firstName ? " input-error" : ""}`} placeholder="John" value={form.firstName} onChange={f("firstName")} />
              {errors.firstName && <p className="error-message">{errors.firstName}</p>}
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input type="text" className={`form-control${errors.lastName ? " input-error" : ""}`} placeholder="Doe" value={form.lastName} onChange={f("lastName")} />
              {errors.lastName && <p className="error-message">{errors.lastName}</p>}
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" className={`form-control${errors.email ? " input-error" : ""}`} placeholder="you@example.com" value={form.email} onChange={f("email")} />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input type="password" className={`form-control${errors.password ? " input-error" : ""}`} placeholder="Min. 8 characters" value={form.password} onChange={f("password")} />
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input type="password" className={`form-control${errors.confirmPassword ? " input-error" : ""}`} placeholder="Repeat password" value={form.confirmPassword} onChange={f("confirmPassword")} />
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" className="form-control" placeholder="+1 (555) 000-0000" value={form.phone} onChange={f("phone")} />
          </div>

          <div className="form-group">
            <label>Location (City, Country)</label>
            <input type="text" className="form-control" placeholder="e.g. Paris, France" value={form.location} onChange={f("location")} />
          </div>

          <div className="form-group">
            <label>Default Currency</label>
            <select className="form-control" value={form.currency} onChange={f("currency")}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner"></span> : <><i className="fa-solid fa-user-plus"></i> Create Account</>}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
