"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--midnight-violet)" }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <i className="fa-solid fa-wallet" style={{ fontSize: 48, color: "var(--harvest-orange)", marginBottom: 16 }}></i>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      {/* Bouton hamburger - visible uniquement en mobile (voir globals.css) */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Overlay derrière le drawer mobile */}
      <div
        className={`sidebar-overlay${mobileOpen ? " active" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <main className={`main-content${collapsed ? " sidebar-collapsed" : ""}`}>
        {children}
      </main>
    </div>
  );
}