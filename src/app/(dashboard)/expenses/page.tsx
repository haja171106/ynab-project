"use client";
import { useEffect, useState, useRef } from "react";
import { useCurrency } from "@/hooks/useCurrency";

interface Category { id: string; title: string; description?: string; }
interface Expense {
  id: string; date: string; amount: number; description?: string;
  receiptUrl?: string; categoryId: string;
  category: { id: string; title: string };
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ date: "", categoryId: "", amount: "", description: "", receiptUrl: "", receiptPublicId: "" });
  const [catForm, setCatForm] = useState({ title: "", description: "" });

  const fetchAll = async () => {
    try {
      const [e, c] = await Promise.all([
        fetch("/api/expenses").then(async r => { if (!r.ok) throw new Error("error"); return r.json(); }),
        fetch("/api/categories").then(async r => { if (!r.ok) throw new Error("error"); return r.json(); })
      ]);
      setExpenses(e);
      setCategories(c);
    } catch (err) {
      console.error("Failed to fetch expenses/categories", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [e, c] = await Promise.all([
          fetch("/api/expenses").then(async r => { if (!r.ok) throw new Error("error"); return r.json(); }),
          fetch("/api/categories").then(async r => { if (!r.ok) throw new Error("error"); return r.json(); })
        ]);
        setExpenses(e);
        setCategories(c);
      } catch (err) {
        console.error("Failed to fetch expenses/categories", err);
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
      fd.append("folder", "receipts");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        showToast(`Upload failed: ${data.error || "Unknown error"}`);
        return;
      }
      setForm(prev => ({ ...prev, receiptUrl: data.url, receiptPublicId: data.publicId }));
    } catch {
      showToast("Upload failed — check your connection");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const method = editExpense ? "PUT" : "POST";
    const url = editExpense ? `/api/expenses/${editExpense.id}` : "/api/expenses";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      showToast(editExpense ? "Expense updated!" : "Expense added!");
      setForm({ date: "", categoryId: "", amount: "", description: "", receiptUrl: "", receiptPublicId: "" });
      setEditExpense(null);
      fetchAll();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    showToast("Expense deleted");
    fetchAll();
  };

  const handleEdit = (expense: Expense) => {
    setEditExpense(expense);
    setForm({
      date: expense.date.split("T")[0],
      categoryId: expense.categoryId,
      amount: expense.amount.toString(),
      description: expense.description || "",
      receiptUrl: expense.receiptUrl || "",
      receiptPublicId: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catForm),
    });
    if (res.ok) {
      showToast("Category created!");
      setCatForm({ title: "", description: "" });
      setShowCatModal(false);
      fetchAll();
    }
  };

  const { format: fmt } = useCurrency();
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track where your money goes</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowCatModal(true)}>
          <i className="fa-solid fa-tag"></i> Manage Categories
        </button>
      </div>

      {/* Form */}
      <div className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--midnight-violet)", marginBottom: 20 }}>
          {editExpense ? <><i className="fa-solid fa-pen" style={{ color: "var(--harvest-orange)", marginRight: 8 }}></i>Edit Expense</> : <><i className="fa-solid fa-plus" style={{ color: "var(--harvest-orange)", marginRight: 8 }}></i>Add New Expense</>}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input type="date" className="form-control" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select className="form-control" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} required style={{ flex: 1 }}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <button type="button" className="btn btn-secondary" style={{ padding: "10px 14px", flexShrink: 0 }} onClick={() => setShowCatModal(true)} title="Add category">
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount *</label>
              <input type="number" step="0.01" min="0" className="form-control" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" className="form-control" placeholder="Brief description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label>Receipt (optional)</label>
            <div
              className={`file-upload-area${uploading ? " dragging" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
            >
              {uploading ? (
                <><div className="spinner" style={{ margin: "0 auto 8px", borderColor: "var(--soft-blush)", borderTopColor: "var(--pacific-cyan)" }}></div><p>Uploading...</p></>
              ) : form.receiptUrl ? (
                <><i className="fa-solid fa-circle-check" style={{ color: "var(--success)" }}></i><p>Receipt uploaded!</p></>
              ) : (
                <><i className="fa-solid fa-cloud-arrow-up"></i><p>Drag & drop or <span>click to browse</span></p><p style={{ fontSize: 12, marginTop: 4 }}>PDF, JPG, PNG up to 10MB</p></>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? <span className="spinner"></span> : <><i className={`fa-solid ${editExpense ? "fa-floppy-disk" : "fa-plus"}`}></i> {editExpense ? "Save Changes" : "Add Expense"}</>}
            </button>
            {editExpense && (
              <button type="button" className="btn btn-secondary" onClick={() => { setEditExpense(null); setForm({ date: "", categoryId: "", amount: "", description: "", receiptUrl: "", receiptPublicId: "" }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* History */}
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--midnight-violet)", marginBottom: 20 }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ color: "var(--pacific-cyan)", marginRight: 8 }}></i>
          Expense History
        </h2>

        {expenses.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-receipt"></i>
            <h3>No expenses yet</h3>
            <p>Add your first expense above to start tracking.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => (
                  <tr key={expense.id}>
                    <td style={{ color: "var(--gray-400)", whiteSpace: "nowrap" }}>{fmtDate(expense.date)}</td>
                    <td><span className="badge badge-category">{expense.category.title}</span></td>
                    <td>{expense.description || <span style={{ color: "var(--gray-400)" }}>—</span>}</td>
                    <td className="amount-negative">{fmt(expense.amount)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(expense)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(expense.id)}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title"><i className="fa-solid fa-tags" style={{ color: "var(--harvest-orange)", marginRight: 8 }}></i>Create Category</h3>
              <button className="modal-close" onClick={() => setShowCatModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="form-group">
                <label>Category Title *</label>
                <input type="text" className="form-control" placeholder="e.g. Food & Dining" value={catForm.title} onChange={e => setCatForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input type="text" className="form-control" placeholder="Optional description" value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary"><i className="fa-solid fa-plus"></i> Create Category</button>
            </form>

            {categories.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--gray-400)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Existing Categories</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {categories.map(c => (
                    <span key={c.id} className="badge badge-category" style={{ fontSize: 13, padding: "6px 12px" }}>{c.title}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <div className={`toast success`}><i className="fa-solid fa-circle-check"></i> {toast}</div>}
    </div>
  );
}
