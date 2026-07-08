"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

const CURRENCIES = [
  { code: "USD", name: "US Dollar ($)" },
  { code: "EUR", name: "Euro (€)" },
  { code: "MGA", name: "Ariary (Ar)" },
  { code: "GBP", name: "British Pound (£)" },
  { code: "JPY", name: "Japanese Yen (¥)" },
  { code: "CAD", name: "Canadian Dollar (C$)" },
];

interface Profile {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  location?: string | null;
  currency: string;
  image?: string | null;
  imagePublicId?: string | null;
}

const EMPTY_FORM: Profile = { id: "", email: "", currency: "USD" };

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Profile>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to fetch profile");
        return r.json();
      })
      .then((d) => {
        setProfile(d);
        setForm(d);
      })
      .catch((e) => console.error("Error fetching profile:", e));
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      // 1. Upload vers Cloudinary
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "avatars");

      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        showToast(uploadData.error || "Upload failed", "error");
        return;
      }

      // 2. Sauvegarde en base + suppression automatique de l'ancienne image
      // Le backend reçoit le nouveau publicId et supprime l'ancien dans Cloudinary
      const saveRes = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile?.firstName ?? "",
          lastName: profile?.lastName ?? "",
          phone: profile?.phone ?? "",
          location: profile?.location ?? "",
          currency: profile?.currency ?? "USD",
          image: uploadData.url,
          imagePublicId: uploadData.publicId, // ← envoi du publicId pour gérer la suppression
        }),
      });

      if (saveRes.ok) {
        const updated = await saveRes.json();
        setProfile(updated);
        setForm(updated);
        await update();
        showToast("Profile photo updated!");
      } else {
        showToast("Photo uploaded but failed to save", "error");
      }
    } catch {
      showToast("Upload failed — check your connection", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setForm(updated);
        setEditing(false);
        await update();
        showToast("Profile updated!");
      } else {
        showToast("Failed to save profile", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const initials =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
      : profile?.name
      ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "U";

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your personal information</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Cover */}
        <div
          style={{
            height: 180,
            background: "linear-gradient(135deg, #3F2734, #5a3a4a)",
            position: "relative",
          }}
        />

        <div style={{ padding: "16px 32px 32px" }}>
          {/* Avatar */}
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: 24,
              marginTop: -48,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "4px solid white",
                background: "#F57A00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                color: "white",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {profile?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.image}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}

              {uploading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="spinner" />
                </div>
              )}
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              title="Change profile photo"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                background: "#F57A00",
                borderRadius: "50%",
                border: "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: uploading ? "not-allowed" : "pointer",
                color: "white",
                fontSize: 11,
              }}
            >
              <i className="fa-solid fa-pencil" />
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
                // Reset input pour permettre de re-sélectionner le même fichier
                e.target.value = "";
              }}
            />
          </div>

          {!editing ? (
            <>
              <div className="profile-info-grid">
                {[
                  { icon: "fa-user", label: "First Name", value: profile?.firstName },
                  { icon: "fa-user", label: "Last Name", value: profile?.lastName },
                  { icon: "fa-envelope", label: "Email", value: profile?.email },
                  { icon: "fa-phone", label: "Phone", value: profile?.phone },
                  { icon: "fa-location-dot", label: "Location", value: profile?.location },
                  { icon: "fa-coins", label: "Currency", value: profile?.currency },
                ].map((field) => (
                  <div
                    key={field.label}
                    style={{
                      background: "var(--gray-50)",
                      borderRadius: 12,
                      padding: "14px 18px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--gray-400)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 6,
                      }}
                    >
                      <i className={`fa-solid ${field.icon}`} style={{ marginRight: 6 }} />
                      {field.label}
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--midnight-violet)" }}>
                      {field.value || (
                        <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>
                          Not set
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ width: "auto" }}
                onClick={() => setEditing(true)}
              >
                <i className="fa-solid fa-pen" /> Edit Profile
              </button>
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.firstName || ""}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.lastName || ""}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email || ""}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone || ""}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="City, Country"
                    value={form.location || ""}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Default Currency</label>
                <select
                  className="form-control"
                  value={form.currency || "USD"}
                  onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="btn btn-primary"
                  style={{ width: "auto" }}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner" />
                  ) : (
                    <><i className="fa-solid fa-floppy-disk" /> Save Changes</>
                  )}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(false);
                    setForm(profile ?? EMPTY_FORM);
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          <i
            className={`fa-solid ${
              toast.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"
            }`}
          />
          {" "}{toast.msg}
        </div>
      )}
    </div>
  );
}