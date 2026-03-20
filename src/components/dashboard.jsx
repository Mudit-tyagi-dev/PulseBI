import React, { useState, useRef } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Tooltip, Legend,
} from "chart.js";
import "../styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

const PALETTE = ["#6c63ff","#10d9a0","#f59e0b","#ef4444","#3b82f6","#a855f7","#ec4899","#06b6d4"];
const STAT_COLORS = ["#6c63ff","#10d9a0","#f59e0b","#94a3b8"];
const MAX_PER_CONTAINER = 5;

function isDark() {
  return document.documentElement.getAttribute("data-theme") !== "light";
}

function makeOpts() {
  const dark = isDark();
  return {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 500, easing: "easeInOutQuart" },
    plugins: {
      legend: {
        labels: {
          color: dark ? "#94a3b8" : "#4a5080",
          font: { size: 11, family: "Outfit, sans-serif" },
          padding: 16, usePointStyle: true, pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: dark ? "rgba(8,12,30,0.96)" : "rgba(255,255,255,0.98)",
        titleColor: dark ? "#f1f5f9" : "#0f1130",
        bodyColor: dark ? "#94a3b8" : "#4a5080",
        borderColor: "rgba(108,99,255,0.3)",
        borderWidth: 1, padding: 10, cornerRadius: 8, boxPadding: 4,
      },
    },
    scales: {
      x: {
        ticks: { color: dark ? "#64748b" : "#94a3b8", font: { size: 10 }, maxRotation: 35 },
        grid: { color: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)", drawBorder: false },
        border: { color: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)" },
      },
      y: {
        ticks: { color: dark ? "#64748b" : "#94a3b8", font: { size: 10 } },
        grid: { color: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)", drawBorder: false },
        border: { color: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)" },
      },
    },
  };
}

function makePieOpts() {
  const dark = isDark();
  return {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 500 },
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: dark ? "#94a3b8" : "#4a5080",
          font: { size: 11 }, padding: 14,
          usePointStyle: true, pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: dark ? "rgba(8,12,30,0.96)" : "rgba(255,255,255,0.98)",
        titleColor: dark ? "#f1f5f9" : "#0f1130",
        bodyColor: dark ? "#94a3b8" : "#4a5080",
        borderColor: "rgba(108,99,255,0.3)",
        borderWidth: 1, padding: 10, cornerRadius: 8,
      },
    },
  };
}

function fmt(val) {
  if (typeof val !== "number") return val ?? "—";
  if (Math.abs(val) >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
  if (Math.abs(val) >= 1_000) return (val / 1_000).toFixed(1) + "K";
  return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2);
}

function KpiCard({ label, value }) {
  const num = typeof value === "number" ? value : parseFloat(value) || 0;
  return (
    <div className="kpi-card">
      <div className="kpi-card-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.7">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>
      <div className="kpi-card-value">{fmt(num)}</div>
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-bar"><div className="kpi-card-bar-fill"/></div>
    </div>
  );
}

function ChartRenderer({ d }) {
  const chartType = d.chart_type || "bar";
  const isPie = ["pie","doughnut"].includes(chartType);
  const isLine = chartType === "line";
  const isBar = !isLine && !isPie;

  const chartData = {
    labels: d.labels || [],
    datasets: (d.datasets || []).map((ds, i) => {
      const base = PALETTE[i % PALETTE.length];
      const data = (ds.data || []).map(v => typeof v === "number" ? v : parseFloat(v) || 0);
      return {
        ...ds, data,
        backgroundColor: isPie ? PALETTE.slice(0, data.length)
          : isBar ? (d.labels || []).map((_, li) => PALETTE[li % PALETTE.length])
          : base + "28",
        borderColor: isPie ? PALETTE.slice(0, data.length) : base,
        borderWidth: isPie ? 2 : isLine ? 2.5 : 0,
        borderRadius: isBar ? 5 : 0,
        tension: 0.4, pointRadius: isLine ? 4 : 0, pointHoverRadius: 6,
        pointBackgroundColor: base, pointBorderColor: "transparent", fill: isLine,
      };
    }),
  };

  const opts = isPie ? makePieOpts() : makeOpts();
  switch (chartType) {
    case "line":     return <Line     data={chartData} options={opts}/>;
    case "pie":      return <Pie      data={chartData} options={opts}/>;
    case "doughnut": return <Doughnut data={chartData} options={opts}/>;
    default:         return <Bar      data={chartData} options={opts}/>;
  }
}

// ── CardMenu ──
function CardMenu({ pinned, onPin, onDelete, sqlQuery, userQuery }) {
  const [open, setOpen] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [showQuery, setShowQuery] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const ref = useRef(null);

  React.useEffect(() => {
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="db-menu-root">
      <div className="db-menu-wrap" ref={ref}>
        <button className="db-dots-btn" onClick={() => setOpen(p => !p)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
        {open && (
          <div className="db-dropdown">
            {/* Pin */}
            <button className="db-dd-item" onClick={() => { onPin(); setOpen(false); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l2.4 6.4L21 10l-4.8 4.4 1.4 6.6L12 18l-5.6 3 1.4-6.6L3 10l6.6-1.6z"/>
              </svg>
              {pinned ? "Unpin" : "📌 Pin to Compare"}
            </button>
            <div className="db-dd-divider"/>
            {/* View Query */}
            <button className="db-dd-item" onClick={() => { setShowQuery(p => !p); setOpen(false); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              {showQuery ? "Hide Query" : "View Query"}
            </button>
            {/* View SQL */}
            <button className="db-dd-item" onClick={() => { setShowSql(p => !p); setOpen(false); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              {showSql ? "Hide SQL" : "View SQL"}
            </button>
            <div className="db-dd-divider"/>
            {/* Delete */}
            {!confirmDelete ? (
              <button className="db-dd-item db-dd-delete" onClick={() => setConfirmDelete(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
                Delete Chart
              </button>
            ) : (
              <div className="db-dd-confirm">
                <span>Delete this chart?</span>
                <div className="db-dd-confirm-btns">
                  <button className="db-dd-confirm-yes" onClick={() => { onDelete(); setOpen(false); setConfirmDelete(false); }}>Yes</button>
                  <button className="db-dd-confirm-no" onClick={() => setConfirmDelete(false)}>No</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {(showQuery || showSql) && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
          {showQuery && (
            <div className="db-drawer" style={{ flex: 1, minWidth: "180px" }}>
              <div className="db-drawer-head">
                <span>Your Query</span>
                <button onClick={() => setShowQuery(false)}>✕</button>
              </div>
              <p className="db-drawer-text">{userQuery || "—"}</p>
            </div>
          )}
          {showSql && (
            <div className="db-drawer db-drawer-sql" style={{ flex: 2, minWidth: "240px" }}>
              <div className="db-drawer-head">
                <span>SQL Query</span>
                <button onClick={() => setShowSql(false)}>✕</button>
              </div>
              <pre className="db-sql-pre">{sqlQuery || "No SQL query available."}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ChartSlide ──
function ChartSlide({ item, pinned, onPin, onDelete, index, total }) {
  const d = item?.data;
  if (!d) return null;

  const sqlQuery = item.sql_query || d.sql_query || null;
  const isKpi = d.chart_type === "kpi";
  const values = (d.datasets?.[0]?.data || []).map(v => typeof v === "number" ? v : parseFloat(v) || 0);
  const stats = !isKpi && values.length > 0 ? {
    total: values.reduce((a, b) => a + b, 0),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    max: Math.max(...values),
    min: Math.min(...values),
  } : null;

  return (
    <div className="chart-slide">
      <div className="chart-slide-head">
        <div className="chart-slide-head-left">
          <span className="db-type-chip">{d.chart_type?.toUpperCase() || "CHART"}</span>
          <span className="chart-slide-title" title={d.datasets?.[0]?.label || item.query}>
            {d.datasets?.[0]?.label || item.query || "Chart"}
          </span>
        </div>
        <div className="chart-slide-head-right">
          <button className={`chart-pin-btn ${pinned ? "pinned" : ""}`} onClick={onPin} title={pinned ? "Unpin" : "Pin to Compare"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M12 2l2.4 6.4L21 10l-4.8 4.4 1.4 6.6L12 18l-5.6 3 1.4-6.6L3 10l6.6-1.6z"/>
            </svg>
          </button>
          <span className="chart-slide-counter">{index + 1}<span style={{opacity:.3}}>/</span>{total}</span>
          <CardMenu pinned={pinned} onPin={onPin} onDelete={onDelete} sqlQuery={sqlQuery} userQuery={item.query}/>
        </div>
      </div>

      {isKpi && <KpiCard label={d.datasets?.[0]?.label} value={values[0]}/>}

      {!isKpi && (
        <>
          {stats && (
            <div className="db-stats-row">
              {[["Total",stats.total],["Avg",stats.avg],["Max",stats.max],["Min",stats.min]].map(([l,v],i) => (
                <div key={l} className="db-stat" style={{"--stat-color": STAT_COLORS[i]}}>
                  <span className="db-stat-dot" style={{background: STAT_COLORS[i]}}/>
                  <span className="db-stat-label">{l}</span>
                  <span className="db-stat-val">{fmt(v)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="db-chart-area"><ChartRenderer d={d}/></div>
          {d.reason && (
            <div className="db-reason">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:1}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {d.reason}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── ChartContainer ──
function ChartContainer({ charts, containerIndex, pinnedIds, onTogglePin, onDeleteChart }) {
  const [slideIndex, setSlideIndex] = useState(0);

  const sorted = [
    ...charts.filter(c => pinnedIds.has(c.id)),
    ...charts.filter(c => !pinnedIds.has(c.id)),
  ];

  // Pin hone pe carousel reset — pinned chart pehle aaye
  React.useEffect(() => {
    if (sorted.some(c => pinnedIds.has(c.id))) setSlideIndex(0);
  }, [pinnedIds]);

  const total = sorted.length;
  const safeIdx = Math.min(slideIndex, total - 1);
  const current = sorted[safeIdx];

  return (
    <div className="chart-container">
      <div className="chart-container-nav">
        <div className="chart-container-nav-left">
          <span className="chart-container-label">Chart {containerIndex + 1}</span>
          {charts.some(c => pinnedIds.has(c.id)) && (
            <span className="chart-container-pinned-badge">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 6.4L21 10l-4.8 4.4 1.4 6.6L12 18l-5.6 3 1.4-6.6L3 10l6.6-1.6z"/>
              </svg>
              Pinned
            </span>
          )}
        </div>
        <div className="chart-container-nav-right">
          <button className="chart-nav-arrow" onClick={() => setSlideIndex(p => Math.max(0, p-1))} disabled={safeIdx === 0}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="chart-nav-count">{safeIdx + 1} / {total}</span>
          <button className="chart-nav-arrow" onClick={() => setSlideIndex(p => Math.min(total-1, p+1))} disabled={safeIdx === total-1}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      {total > 1 && (
        <div className="chart-dots">
          {sorted.map((c, i) => (
            <button key={c.id} className={`chart-dot ${i === safeIdx ? "active" : ""} ${pinnedIds.has(c.id) ? "pinned" : ""}`} onClick={() => setSlideIndex(i)}/>
          ))}
        </div>
      )}

      <ChartSlide
        item={current}
        pinned={pinnedIds.has(current?.id)}
        onPin={() => onTogglePin(current?.id)}
        onDelete={() => {
          onDeleteChart(current?.id);
          setSlideIndex(p => Math.max(0, p - 1));
        }}
        index={safeIdx}
        total={total}
      />
    </div>
  );
}

// ── CompareScreen ──
function CompareScreen({ pinnedIds, allCharts, onClose }) {
  const pinned = allCharts.filter(c => pinnedIds.has(c.id));
  const [selected, setSelected] = useState(() => pinned.slice(0, 2).map(c => c.id));

  function toggleSelect(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
      : prev.length < 2 ? [...prev, id] : prev
    );
  }

  const compareCharts = selected.map(id => allCharts.find(c => c.id === id)).filter(Boolean);

  return (
    <div className="compare-screen">
      <div className="compare-header">
        <div className="compare-header-left">
          <div className="compare-header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/>
            </svg>
          </div>
          <div>
            <h2 className="compare-title">Compare Charts</h2>
            <p className="compare-sub">Select up to 2 pinned charts to compare side by side</p>
          </div>
        </div>
        <button className="compare-close-btn" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="compare-pinned-section">
        <div className="compare-section-label">
          Pinned Charts <span className="compare-section-count">{pinned.length}</span>
        </div>
        {pinned.length === 0 ? (
          <div className="compare-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M12 2l2.4 6.4L21 10l-4.8 4.4 1.4 6.6L12 18l-5.6 3 1.4-6.6L3 10l6.6-1.6z"/>
            </svg>
            <p>No pinned charts yet. Pin charts from the dashboard.</p>
          </div>
        ) : (
          <div className="compare-pinned-grid">
            {pinned.map(chart => {
              const isSelected = selected.includes(chart.id);
              const isDisabled = !isSelected && selected.length >= 2;
              return (
                <button key={chart.id} className={`compare-chart-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`} onClick={() => !isDisabled && toggleSelect(chart.id)}>
                  {isSelected && (
                    <div className="compare-selected-badge">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      {selected.indexOf(chart.id) + 1}
                    </div>
                  )}
                  <div className="compare-card-type">{chart.data?.chart_type?.toUpperCase()}</div>
                  <div className="compare-card-title">{chart.data?.datasets?.[0]?.label || chart.query || "Chart"}</div>
                  <div className="compare-card-preview">
                    <div className="compare-mini-bars">
                      {(chart.data?.datasets?.[0]?.data || []).slice(0, 6).map((v, i) => {
                        const max = Math.max(...(chart.data?.datasets?.[0]?.data || [1]));
                        return <div key={i} className="compare-mini-bar" style={{ height: `${Math.max(8, (v/max)*40)}px`, background: PALETTE[i % PALETTE.length] }}/>;
                      })}
                    </div>
                  </div>
                  <div className="compare-card-query">{chart.query}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {compareCharts.length === 2 && (
        <div className="compare-view">
          <div className="compare-view-label">Comparing {compareCharts.length} charts</div>
          <div className="compare-charts-row">
            {compareCharts.map((chart, i) => {
              const d = chart.data;
              const values = (d?.datasets?.[0]?.data || []).map(v => typeof v === "number" ? v : parseFloat(v) || 0);
              return (
                <div key={chart.id} className="compare-chart-panel">
                  <div className="compare-panel-head">
                    <span className="compare-panel-num">{i + 1}</span>
                    <span className="compare-panel-title">{d?.datasets?.[0]?.label || chart.query}</span>
                    <span className="db-type-chip">{d?.chart_type?.toUpperCase()}</span>
                  </div>
                  {d?.chart_type === "kpi" ? (
                    <KpiCard label={d?.datasets?.[0]?.label} value={values[0]}/>
                  ) : (
                    <div className="compare-chart-area"><ChartRenderer d={d}/></div>
                  )}
                  <div className="compare-panel-stats">
                    {values.length > 0 && (
                      <>
                        <div className="compare-stat"><span>Total</span><strong>{fmt(values.reduce((a,b)=>a+b,0))}</strong></div>
                        <div className="compare-stat"><span>Max</span><strong>{fmt(Math.max(...values))}</strong></div>
                        <div className="compare-stat"><span>Avg</span><strong>{fmt(values.reduce((a,b)=>a+b,0)/values.length)}</strong></div>
                      </>
                    )}
                  </div>
                  {chart.query && (
                    <div className="compare-panel-query">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                      {chart.query}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selected.length === 1 && <div className="compare-hint">Select one more chart to compare</div>}
      {selected.length === 0 && pinned.length > 0 && <div className="compare-hint">Select 2 charts from above to compare</div>}
    </div>
  );
}

// ── Main DashboardBlock ──
export default function DashboardBlock({ messages, onOpenCompare, compareOpen, onCloseCompare, onDeleteChart }) {
  const [pinnedIds, setPinnedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("db_pinned") || "[]")); }
    catch { return new Set(); }
  });

  const chartMsgs = (messages || []).filter(m => m.type === "dashboard" && m.data?.chart_type);
  const kpiCharts = chartMsgs.filter(m => m.data?.chart_type === "kpi");
  const regularCharts = chartMsgs.filter(m => m.data?.chart_type !== "kpi");

  // ✅ Pinned sabse upar
  const sortedRegular = [
    ...regularCharts.filter(c => pinnedIds.has(c.id)),
    ...regularCharts.filter(c => !pinnedIds.has(c.id)),
  ];

  const containers = [];
  for (let i = 0; i < sortedRegular.length; i += MAX_PER_CONTAINER) {
    containers.push(sortedRegular.slice(i, i + MAX_PER_CONTAINER));
  }

  function togglePin(id) {
    if (!id) return;
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // ✅ Pin hone pe Compare window kholo
        setTimeout(() => onOpenCompare(), 50);
      }
      localStorage.setItem("db_pinned", JSON.stringify([...next]));
      return next;
    });
  }

  function handleDelete(id) {
    if (!id) return;
    // Agar pinned tha toh unpin bhi karo
    setPinnedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      localStorage.setItem("db_pinned", JSON.stringify([...next]));
      return next;
    });
    onDeleteChart?.(id);
  }

  if (chartMsgs.length === 0) return null;

  if (compareOpen) {
    return <CompareScreen pinnedIds={pinnedIds} allCharts={chartMsgs} onClose={onCloseCompare}/>;
  }

  return (
    <div className="db-root">
      <div className="db-header">
        <div className="db-header-left">
          <span className="db-title">Dashboard</span>
          <span className="db-badge">{chartMsgs.length} chart{chartMsgs.length !== 1 ? "s" : ""}</span>
          {pinnedIds.size > 0 && (
            <span className="db-pinned-count">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 6.4L21 10l-4.8 4.4 1.4 6.6L12 18l-5.6 3 1.4-6.6L3 10l6.6-1.6z"/>
              </svg>
              {pinnedIds.size} pinned
            </span>
          )}
        </div>
        {pinnedIds.size >= 1 && (
          <button className="db-compare-btn" onClick={onOpenCompare}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/>
            </svg>
            Compare
            <span className="db-compare-badge">{pinnedIds.size}</span>
          </button>
        )}
      </div>

      {kpiCharts.length > 0 && (
        <div className="kpi-row">
          {kpiCharts.map(m => (
            <div key={m.id} className={`kpi-card-wrap ${pinnedIds.has(m.id) ? "kpi-pinned" : ""}`}>
              <button className={`kpi-pin-btn ${pinnedIds.has(m.id) ? "pinned" : ""}`} onClick={() => togglePin(m.id)} title={pinnedIds.has(m.id) ? "Unpin" : "Pin to Compare"}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill={pinnedIds.has(m.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l2.4 6.4L21 10l-4.8 4.4 1.4 6.6L12 18l-5.6 3 1.4-6.6L3 10l6.6-1.6z"/>
                </svg>
              </button>
              <KpiCard label={m.data?.datasets?.[0]?.label} value={m.data?.datasets?.[0]?.data?.[0]}/>
            </div>
          ))}
        </div>
      )}

      <div className="db-containers">
        {containers.map((charts, ci) => (
          <ChartContainer
            key={ci}
            charts={charts}
            containerIndex={ci}
            pinnedIds={pinnedIds}
            onTogglePin={togglePin}
            onDeleteChart={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}