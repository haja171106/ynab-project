"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/hooks/useCurrency";

const CHART_COLORS = ["#0998AE", "#F57A00", "#3F2734", "#22C55E", "#DFCED5", "#FEF1C3", "#8B5CF6", "#EF4444"];

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  chartData: { name: string; value: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const { format: formatCurrency } = useCurrency();

  if (loading) return (
    <div className="page-container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
        <div className="spinner" style={{ borderColor: "var(--soft-blush)", borderTopColor: "var(--harvest-orange)", width: 36, height: 36 }}></div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your financial overview at a glance</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon"><i className="fa-solid fa-arrow-trend-up"></i></div>
          <div className="stat-value">{formatCurrency(data?.totalIncome || 0)}</div>
          <div className="stat-label">Total Income</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-icon"><i className="fa-solid fa-arrow-trend-down"></i></div>
          <div className="stat-value">{formatCurrency(data?.totalExpenses || 0)}</div>
          <div className="stat-label">Total Expenses</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-icon"><i className="fa-solid fa-scale-balanced"></i></div>
          <div className="stat-value" style={{ color: (data?.balance || 0) >= 0 ? "var(--pacific-cyan)" : "var(--danger)" }}>
            {formatCurrency(data?.balance || 0)}
          </div>
          <div className="stat-label">Current Balance</div>
        </div>
        <div className="stat-card savings">
          <div className="stat-icon"><i className="fa-solid fa-piggy-bank"></i></div>
          <div className="stat-value">
            {data?.totalIncome ? `${Math.round(((data.balance) / data.totalIncome) * 100)}%` : "0%"}
          </div>
          <div className="stat-label">Savings Rate</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "var(--midnight-violet)" }}>
            <i className="fa-solid fa-chart-pie" style={{ color: "var(--harvest-orange)", marginRight: 8 }}></i>
            Expenses by Category
          </h2>
          {data?.chartData && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {data.chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-chart-pie"></i>
              <p>No expense data yet. Add some expenses to see the chart.</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "var(--midnight-violet)" }}>
            <i className="fa-solid fa-receipt" style={{ color: "var(--pacific-cyan)", marginRight: 8 }}></i>
            Budget Summary
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { label: "Income", value: data?.totalIncome || 0, color: "var(--pacific-cyan)", icon: "fa-arrow-up" },
              { label: "Expenses", value: data?.totalExpenses || 0, color: "var(--harvest-orange)", icon: "fa-arrow-down" },
              { label: "Remaining", value: data?.balance || 0, color: (data?.balance || 0) >= 0 ? "var(--success)" : "var(--danger)", icon: "fa-wallet" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--gray-50)", borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className={`fa-solid ${item.icon}`} style={{ color: item.color }}></i>
                  </div>
                  <span style={{ fontWeight: 600, color: "var(--gray-600)" }}>{item.label}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 18, color: item.color }}>{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>

          {data && data.totalIncome > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--gray-400)", marginBottom: 8 }}>
                <span>Spending rate</span>
                <span>{Math.min(100, Math.round((data.totalExpenses / data.totalIncome) * 100))}%</span>
              </div>
              <div style={{ height: 8, background: "var(--gray-200)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(100, (data.totalExpenses / data.totalIncome) * 100)}%`,
                  background: data.totalExpenses > data.totalIncome ? "var(--danger)" : "var(--harvest-orange)",
                  borderRadius: 4,
                  transition: "width 0.8s ease",
                }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
