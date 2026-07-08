"use client";
import { useEffect, useState } from "react";

type Tab = "expenses" | "income";

interface FileItem {
  id: string;
  date: string;
  amount: number;
  url: string;
  label: string;
}

interface RawExpense {
  id: string;
  date: string;
  amount: number;
  receiptUrl?: string | null;
  category?: { title?: string };
}

interface RawIncome {
  id: string;
  date: string;
  amount: number;
  source: string;
  documentUrl?: string | null;
}

export default function ArchivePage() {
  const [tab, setTab] = useState<Tab>("expenses");
  const [expenses, setExpenses] = useState<FileItem[]>([]);
  const [incomes, setIncomes] = useState<FileItem[]>([]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  useEffect(() => {
    fetch("/api/expenses").then(r => r.json()).then((data: RawExpense[]) => {
      setExpenses(
        data.filter((e) => e.receiptUrl).map((e) => ({
          id: e.id, date: e.date, amount: e.amount,
          url: e.receiptUrl!,
          label: `${e.category?.title || "Expense"} – ${fmt(e.amount)}`,
        }))
      );
    });
    fetch("/api/income").then(r => r.json()).then((data: RawIncome[]) => {
      setIncomes(
        data.filter((i) => i.documentUrl).map((i) => ({
          id: i.id, date: i.date, amount: i.amount,
          url: i.documentUrl!,
          label: `${i.source} – ${fmt(i.amount)}`,
        }))
      );
    });
  }, []);

  const items = tab === "expenses" ? expenses : incomes;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const getFileIcon = (url: string) => {
    if (url.includes(".pdf") || url.includes("pdf")) return "fa-file-pdf";
    if (url.match(/\.(jpg|jpeg|png|webp|gif)/i)) return "fa-file-image";
    return "fa-file-alt";
  };

  const getFileColor = (url: string) => {
    if (url.includes(".pdf") || url.includes("pdf")) return "#EF4444";
    return "var(--pacific-cyan)";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Archive</h1>
          <p className="page-subtitle">All uploaded receipts and documents</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--gray-100)", borderRadius: 12, padding: 4, marginBottom: 32, width: "fit-content" }}>
        {(["expenses", "income"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 14, fontFamily: "Inter, sans-serif",
              background: tab === t ? "white" : "transparent",
              color: tab === t ? "var(--midnight-violet)" : "var(--gray-400)",
              boxShadow: tab === t ? "0 1px 4px rgba(63,39,52,0.1)" : "none",
              transition: "all 0.2s",
              textTransform: "capitalize",
            }}
          >
            <i className={`fa-solid ${t === "expenses" ? "fa-receipt" : "fa-file-invoice-dollar"}`} style={{ marginRight: 8 }}></i>
            {t} ({t === "expenses" ? expenses.length : incomes.length})
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <i className={`fa-solid ${tab === "expenses" ? "fa-receipt" : "fa-file-invoice-dollar"}`}></i>
            <h3>No documents in archive</h3>
            <p>Upload receipts or documents when adding {tab} to see them here.</p>
          </div>
        </div>
      ) : (
        <div className="archive-grid">
          {items.map(item => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="archive-item"
              style={{ textDecoration: "none" }}
            >
              <i className={`fa-solid ${getFileIcon(item.url)}`} style={{ fontSize: 40, color: getFileColor(item.url), marginBottom: 12 }}></i>
              <div className="archive-item-name">{item.label}</div>
              <div className="archive-item-date">{fmtDate(item.date)}</div>
              <div style={{ marginTop: 12, padding: "6px 12px", background: "var(--gray-50)", borderRadius: 20, fontSize: 11, color: "var(--pacific-cyan)", fontWeight: 600 }}>
                <i className="fa-solid fa-external-link"></i> View File
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
