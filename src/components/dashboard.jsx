import React, { useState } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
);

const PALETTE = [
  "#6c63ff",
  "#10d9a0",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
];

// Theme-aware chart options — reads CSS vars at render time
const makeOpts = () => {
  const isDark =
    document.documentElement.getAttribute("data-theme") !== "light";
  const tickColor = isDark ? "#64748b" : "#94a3b8";
  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)";
  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500, easing: "easeInOutQuart" },
    plugins: {
      legend: {
        labels: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: { size: 11, family: "Outfit, sans-serif" },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: isDark
          ? "rgba(8,12,30,0.95)"
          : "rgba(255,255,255,0.98)",
        titleColor: isDark ? "#f1f5f9" : "#0f1130",
        bodyColor: isDark ? "#94a3b8" : "#4a5080",
        borderColor: "rgba(108,99,255,0.3)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        ticks: { color: tickColor, font: { size: 10 }, maxRotation: 30 },
        grid: { color: gridColor, drawBorder: false },
        border: { color: borderColor },
      },
      y: {
        ticks: { color: tickColor, font: { size: 10 } },
        grid: { color: gridColor, drawBorder: false },
        border: { color: borderColor },
      },
    },
  };
};

const makePieOpts = () => {
  const isDark =
    document.documentElement.getAttribute("data-theme") !== "light";
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: { size: 11 },
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: isDark
          ? "rgba(8,12,30,0.95)"
          : "rgba(255,255,255,0.98)",
        titleColor: isDark ? "#f1f5f9" : "#0f1130",
        bodyColor: isDark ? "#94a3b8" : "#4a5080",
        borderColor: "rgba(108,99,255,0.3)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
  };
};

function fmt(val) {
  if (typeof val !== "number") return val ?? "—";
  if (Math.abs(val) >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
  if (Math.abs(val) >= 1_000) return (val / 1_000).toFixed(1) + "K";
  return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2);
}

function CardMenu({ pinned, onPin, sqlQuery, userQuery }) {
  const [open, setOpen] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [showQuery, setShowQuery] = useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="db-menu-root">
      <div className="db-menu-wrap" ref={ref}>
        <button className="db-dots-btn" onClick={() => setOpen((p) => !p)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
        {open && (
          <div className="db-dropdown">
            <button
              className="db-dd-item"
              onClick={() => {
                onPin();
                setOpen(false);
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l2.4 6.4L21 10l-4.8 4.4 1.4 6.6L12 18l-5.6 3 1.4-6.6L3 10l6.6-1.6z" />
              </svg>
              {pinned ? "Unpin" : "Pin to top"}
            </button>
            <button
              className="db-dd-item"
              onClick={() => {
                setShowQuery((p) => !p);
                setOpen(false);
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              {showQuery ? "Hide query" : "View query"}
            </button>
            <button
              className="db-dd-item"
              onClick={() => {
                setShowSql((p) => !p);
                setOpen(false);
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              {showSql ? "Hide SQL" : "View SQL"}
            </button>
          </div>
        )}
      </div>

      {showQuery && (
        <div className="db-drawer">
          <div className="db-drawer-head">
            <span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Your Query
            </span>
            <button onClick={() => setShowQuery(false)}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <p className="db-drawer-text">{userQuery || "—"}</p>
        </div>
      )}

      {showSql && (
        <div className="db-drawer db-drawer-sql">
          <div className="db-drawer-head">
            <span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              SQL Query
            </span>
            <button onClick={() => setShowSql(false)}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <pre className="db-sql-pre">{sqlQuery || "—"}</pre>
        </div>
      )}
    </div>
  );
}

function ChartCard({
  item,
  pinned,
  onPin,
  index,
  total,
  onMoveLeft,
  onMoveRight,
}) {
  const d = item?.data;
  if (!d) return null;

  const isKpi = d.chart_type === "kpi";
  const isPie = ["pie", "doughnut"].includes(d.chart_type);
  const isLine = d.chart_type === "line";
  const isBar = !isLine && !isPie && !isKpi;
  const values = d.datasets?.[0]?.data || [];

  const stats =
    !isKpi && values.length > 0
      ? {
          total: values.reduce((a, b) => a + b, 0),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          max: Math.max(...values),
          min: Math.min(...values),
        }
      : null;

  const chartData = {
    labels: d.labels || [],
    datasets: (d.datasets || []).map((ds, i) => ({
      ...ds,
      backgroundColor: isPie
        ? PALETTE.slice(0, ds.data?.length)
        : isBar
          ? (d.labels || []).map((_, li) => PALETTE[li % PALETTE.length])
          : PALETTE[i % PALETTE.length] + "30",
      borderColor: isPie
        ? PALETTE.slice(0, ds.data?.length)
        : PALETTE[i % PALETTE.length],
      borderWidth: isPie ? 2 : isLine ? 2.5 : 0,
      tension: 0.4,
      pointRadius: isLine ? 4 : 0,
      pointHoverRadius: 6,
      pointBackgroundColor: PALETTE[i % PALETTE.length],
      fill: isLine,
    })),
  };

  const renderChart = () => {
    const opts = isPie ? makePieOpts() : makeOpts();
    switch (d.chart_type) {
      case "line":
        return <Line data={chartData} options={opts} />;
      case "pie":
        return <Pie data={chartData} options={opts} />;
      case "doughnut":
        return <Doughnut data={chartData} options={opts} />;
      default:
        return <Bar data={chartData} options={opts} />;
    }
  };

  const STAT_COLORS = ["#6c63ff", "#10d9a0", "#f59e0b", "#94a3b8"];

  return (
    <div className={`db-card ${pinned ? "db-card-pinned" : ""}`}>
      {pinned && <div className="db-card-accent" />}

      <div className="db-card-head">
        <div className="db-card-head-left">
          <span className="db-type-chip">
            {d.chart_type?.toUpperCase() || "CHART"}
          </span>
          <span
            className="db-card-title"
            title={d.datasets?.[0]?.label || item.query}
          >
            {d.datasets?.[0]?.label || item.query || "Chart"}
          </span>
        </div>
        <div className="db-card-head-right">
          <button
            className="db-nav-btn"
            onClick={onMoveLeft}
            disabled={index === 0}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="db-counter">
            {index + 1}
            <span style={{ opacity: 0.4 }}>/</span>
            {total}
          </span>
          <button
            className="db-nav-btn"
            onClick={onMoveRight}
            disabled={index === total - 1}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <CardMenu
            pinned={pinned}
            onPin={onPin}
            sqlQuery={item.sql_query}
            userQuery={item.query}
          />
        </div>
      </div>

      {isKpi ? (
        <div className="db-kpi-wrap">
          <div className="db-kpi-ring">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="rgba(108,99,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="url(#kpiGrad)"
                strokeWidth="8"
                strokeDasharray="213"
                strokeDashoffset="53"
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
              <defs>
                <linearGradient id="kpiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6c63ff" />
                  <stop offset="100%" stopColor="#10d9a0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="db-kpi-label">{d.datasets?.[0]?.label}</div>
          <div className="db-kpi-value">{fmt(values[0])}</div>
        </div>
      ) : (
        <>
          {stats && (
            <div className="db-stats-row">
              {[
                ["Total", stats.total],
                ["Avg", stats.avg],
                ["Max", stats.max],
                ["Min", stats.min],
              ].map(([l, v], i) => (
                <div
                  key={l}
                  className="db-stat"
                  style={{ "--stat-color": STAT_COLORS[i] }}
                >
                  <span
                    className="db-stat-dot"
                    style={{ background: STAT_COLORS[i] }}
                  />
                  <span className="db-stat-label">{l}</span>
                  <span className="db-stat-val">{fmt(v)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="db-chart-area">{renderChart()}</div>
          {d.reason && (
            <div className="db-reason">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {d.reason}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardBlock({ messages }) {
  const [order, setOrder] = React.useState(null);
  const [pinnedIds, setPinnedIds] = React.useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("db_pinned") || "[]"));
    } catch {
      return new Set();
    }
  });
  const [page, setPage] = React.useState(0);
  const PER_PAGE = 3;

  const chartMsgs = (messages || []).filter(
    (m) => m.type === "dashboard" && m.data?.chart_type,
  );

  const ordered = React.useMemo(() => {
    if (!order) return chartMsgs;
    const map = Object.fromEntries(chartMsgs.map((m) => [m.id, m]));
    const result = order.map((id) => map[id]).filter(Boolean);
    chartMsgs.forEach((m) => {
      if (!order.includes(m.id)) result.push(m);
    });
    return result;
  }, [chartMsgs, order]);

  const sorted = [
    ...ordered.filter((m) => pinnedIds.has(m.id)),
    ...ordered.filter((m) => !pinnedIds.has(m.id)),
  ];

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const visible = sorted.slice(
    safePage * PER_PAGE,
    safePage * PER_PAGE + PER_PAGE,
  );

  function togglePin(id) {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("db_pinned", JSON.stringify([...next]));
      return next;
    });
  }

  function swap(a, b) {
    if (a < 0 || b >= sorted.length) return;
    const arr = [...sorted];
    [arr[a], arr[b]] = [arr[b], arr[a]];
    setOrder(arr.map((m) => m.id));
  }

  if (sorted.length === 0) return null;

  return (
    <div className="db-root">
      <div className="db-header">
        <div className="db-header-left">
          <span className="db-title">Dashboard</span>
          <span className="db-badge">
            {sorted.length} chart{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="db-pager">
          <button
            className="db-page-btn"
            onClick={() => setPage((p) => p - 1)}
            disabled={safePage === 0}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Prev
          </button>
          <span className="db-page-info">
            {safePage + 1} / {totalPages || 1}
          </span>
          <button
            className="db-page-btn"
            onClick={() => setPage((p) => p + 1)}
            disabled={safePage >= totalPages - 1}
          >
            Next
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="db-grid">
        {visible.map((item, idx) => {
          const gi = safePage * PER_PAGE + idx;
          return (
            <ChartCard
              key={item.id || idx}
              item={item}
              index={gi}
              total={sorted.length}
              pinned={pinnedIds.has(item.id)}
              onPin={() => togglePin(item.id)}
              onMoveLeft={() => swap(gi, gi - 1)}
              onMoveRight={() => swap(gi, gi + 1)}
            />
          );
        })}
      </div>
    </div>
  );
}
