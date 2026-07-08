"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import styles from "../auth.module.css";

const CURRENCIES = ["USD — US Dollar", "EUR — Euro", "MGA — Ariary (Madagascar)", "GBP — British Pound", "JPY — Japanese Yen", "CAD — Canadian Dollar", "AUD — Australian Dollar", "CHF — Swiss Franc", "CNY — Chinese Yuan", "INR — Indian Rupee"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "", location: "", currency: "USD" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName) e.firstName = "First name is required";
    if (!form.lastName) e.lastName = "Last name is required";
    if (!form.email) e.email = "Email is required";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, currency: form.currency.split(" ")[0] }),
    });
    const data = await res.json();
    if (!res.ok) { setApiError(data.error); setLoading(false); return; }

    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/dashboard");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 520 }}>
        <div className={styles.logoSection}>
          <Image src="/logo.png" alt="YNAB" width={48} height={48} className={styles.logo} />
          <h1 className={styles.brand}>YNAB</h1>
          <p className={styles.tagline}>You Need A Budget</p>
        </div>

        <h2 className={styles.title}>Create your account</h2>
        <p className={styles.subtitle}>Start taking control of your budget today</p>

        {apiError && <div className={styles.errorBanner}><i className="fa-solid fa-circle-exclamation" /> {apiError}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.twoCol}>
            <Input label="First Name" value={form.firstName} onChange={e => set("firstName", e.target.value)} error={errors.firstName} icon="fa-user" placeholder="John" required />
            <Input label="Last Name" value={form.lastName} onChange={e => set("lastName", e.target.value)} error={errors.lastName} placeholder="Doe" required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={e => set("email", e.target.value)} error={errors.email} icon="fa-envelope" placeholder="you@example.com" required />
          <Input label="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} error={errors.password} icon="fa-lock" placeholder="At least 6 characters" required />
          <Input label="Phone Number" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} icon="fa-phone" placeholder="+1 555 000 0000" />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Location</label>
            <input
              list="cities-list"
              value={form.location}
              onChange={e => set("location", e.target.value)}
              placeholder="Search city or country..."
              style={{ padding: "10px 14px", borderRadius: 10, border: "2px solid var(--border)", fontSize: "0.9rem", outline: "none", width: "100%" }}
            />
            <datalist id="cities-list">
              {["Paris, France","New York, USA","London, UK","Tokyo, Japan","Dubai, UAE","Antananarivo, Madagascar","Nairobi, Kenya","Sydney, Australia","Toronto, Canada","Berlin, Germany"].map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Currency</label>
            <input list="currencies-list" value={form.currency} onChange={e => set("currency", e.target.value)}
              placeholder="Search currency..."
              style={{ padding: "10px 14px", borderRadius: 10, border: "2px solid var(--border)", fontSize: "0.9rem", outline: "none", width: "100%" }} />
            <datalist id="currencies-list">{CURRENCIES.map(c => <option key={c} value={c} />)}</datalist>
          </div>

          <Button type="submit" full loading={loading} style={{ marginTop: 4 }}>Create Account</Button>
        </form>

        <div className={styles.divider}><span>or sign up with</span></div>
        <button className={styles.googleBtn} onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
          <i className="fa-brands fa-google" /> Sign up with Google
        </button>

        <p className={styles.switchLink}>Already have an account? <Link href="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
