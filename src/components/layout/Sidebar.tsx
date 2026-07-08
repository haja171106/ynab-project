"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", icon: "fa-solid fa-chart-pie", label: "Dashboard" },
  {
    href: "/expenses",
    icon: "fa-solid fa-arrow-trend-down",
    label: "Expenses",
  },
  { href: "/income", icon: "fa-solid fa-arrow-trend-up", label: "Income" },
  { href: "/archive", icon: "fa-solid fa-folder-open", label: "Archive" },
  { href: "/profile", icon: "fa-solid fa-user-circle", label: "Profile" },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <aside
      className={`sidebar${collapsed ? " collapsed" : ""}${
        mobileOpen ? " mobile-open" : ""
      }`}
    >
      {/* Bouton toggle desktop/tablette - masqué sur mobile (voir globals.css) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="sidebar-toggle"
        title={collapsed ? "Expand" : "Collapse"}
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>

      {/* Bouton fermer - visible uniquement sur mobile quand le drawer est ouvert */}
      <button
        onClick={() => setMobileOpen(false)}
        className="sidebar-close-btn"
        aria-label="Close menu"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>

      {/* Logo */}
      <div className="sidebar-logo">
        <Image src="/logo.png" alt="Logo" width={32} height={32} />
        {!collapsed && (
          <span className="sidebar-logo-text">
            Y<span>NAB</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-label">Main Menu</div>}

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`nav-item${isActive ? " active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <i className={item.icon}></i>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.image ? <img src={user.image} alt="" /> : initials}
          </div>

          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div className="user-name">{user?.name || "User"}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed ? "Logout" : undefined}
          className="btn-logout"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}