"use client";
import { useEffect, useState, useRef } from "react";
import { useCurrency } from "@/hooks/useCurrency";

const INCOME_SOURCES = ["Salary", "Freelance", "Business", "Investment", "Gift", "Donation", "Rental", "Bonus", "Other"];

interface Income {
  id: string; date: string; amount: number; source: string; notes?: string; documentUrl?: string;
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [editIncome, setEditIncome] = useState<Income | null>(null);
  const [form, setForm] = useState({ date: "", source: "", amount: "", notes: "", documentUrl: "", documentPublicId: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchIncomes = async () => {
    try {
      const r = await fetch("/api/income");
      if (!r.ok) throw new Error("Failed");
      const data = await r.json();
      setIncomes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/income");
        if (!r.ok) throw new Error("Failed");
        const data = await r.json();
        setIncomes(data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "income-docs");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        showToast(`Upload failed: ${data.error || "Unknown error"}`);
        return;
      }
      setForm(prev => ({ ...prev, documentUrl: data.url, documentPublicId: data.publicId }));
    } catch {
      showToast("Upload failed — check your connection");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const method = editIncome ? "PUT" : "POST";
    const url = editIncome ? `/api/income/${editIncome.id}` : "/api/income";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      showToast(editIncome ? "Income updated!" : "Income added!");
      setForm({ date: "", source: "", amount: "", notes: "", documentUrl: "", documentPublicId: "" });
      setEditIncome(null);
      fetchIncomes();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this income record?")) return;
    await fetch(`/api/income/${id}`, { method: "DELETE" });
    showToast("Income deleted");
    fetchIncomes();
  };

  const handleEdit = (income: Income) => {
    setEditIncome(income);
    setForm({ date: income.date.split("T")[0], source: income.source, amount: income.amount.toString(), notes: income.notes || "", documentUrl: income.documentUrl || "", documentPublicId: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { format: fmt } = useCurrency();
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Income</h1>
          <p className="page-subtitle">Record and manage your earnings</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--midnight-violet)", marginBottom: 20 }}>
          {editIncome
            ? <><i className="fa-solid fa-pen" style={{ color: "var(--pacific-cyan)", marginRight: 8 }}></i>Edit Income</>
            : <><i className="fa-solid fa-plus" style={{ color: "var(--pacific-cyan)", marginRight: 8 }}></i>Add New Income</>}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input type="date" className="form-control" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Source *</label>
              <select className="form-control" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} required>
                <option value="">Select source</option>
                {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount *</label>
              <input type="number" step="0.01" min="0" className="form-control" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <input type="text" className="form-control" placeholder="Optional notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label>Document (optional — pay slip, contract, etc.)</label>
            <div
              className={`file-upload-area${uploading ? " dragging" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
            >
              {uploading ? (
                <><div className="spinner" style={{ margin: "0 auto 8px", borderColor: "var(--soft-blush)", borderTopColor: "var(--pacific-cyan)" }}></div><p>Uploading...</p></>
              ) : form.documentUrl ? (
                <><i className="fa-solid fa-circle-check" style={{ color: "var(--success)" }}></i><p>Document uploaded!</p></>
              ) : (
                <><i className="fa-solid fa-cloud-arrow-up"></i><p>Drag & drop or <span>click to browse</span></p><p style={{ fontSize: 12, marginTop: 4 }}>PDF, JPG, PNG up to 10MB</p></>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, background: "var(--pacific-cyan)" }}>
              {loading ? <span className="spinner"></span> : <><i className={`fa-solid ${editIncome ? "fa-floppy-disk" : "fa-plus"}`}></i> {editIncome ? "Save Changes" : "Add Income"}</>}
            </button>
            {editIncome && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditIncome(null); setForm({ date: "", source: "", amount: "", notes: "", documentUrl: "", documentPublicId: "" }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--midnight-violet)", marginBottom: 20 }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ color: "var(--pacific-cyan)", marginRight: 8 }}></i>
          Income History
        </h2>

        {incomes.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-sack-dollar"></i>
            <h3>No income recorded</h3>
            <p>Add your first income entry above.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Date</th><th>Source</th><th>Notes</th><th>Amount</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {incomes.map(income => (
                  <tr key={income.id}>
                    <td style={{ color: "var(--gray-400)", whiteSpace: "nowrap" }}>{fmtDate(income.date)}</td>
                    <td><span className="badge" style={{ background: "rgba(9,152,174,0.1)", color: "var(--pacific-cyan)" }}>{income.source}</span></td>
                    <td>{income.notes || <span style={{ color: "var(--gray-400)" }}>—</span>}</td>
                    <td className="amount-positive">{fmt(income.amount)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(income)}><i className="fa-solid fa-pen"></i></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(income.id)}><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <div className="toast success"><i className="fa-solid fa-circle-check"></i> {toast}</div>}
    </div>
  );
}
