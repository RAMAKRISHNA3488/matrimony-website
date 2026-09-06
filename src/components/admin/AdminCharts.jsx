import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  PieChart as PieIcon,
  Users,
  Activity
} from 'lucide-react';

/**
 * Interactive Curved Line / Area Chart for Registrations Overview
 * Supports 7 Days, 30 Days, 90 Days period toggling.
 */
export function RegistrationAreaChart() {
  const [period, setPeriod] = useState('30d');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const dataset = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      newRegs: [42, 65, 58, 89, 112, 145, 128],
      activeUsers: [320, 390, 410, 480, 560, 620, 590],
      totalNew: '639',
      trend: '+19.4%'
    },
    '30d': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      newRegs: [580, 710, 840, 912],
      activeUsers: [14200, 16800, 18900, 21400],
      totalNew: '3,042',
      trend: '+18.7%'
    },
    '90d': {
      labels: ['Dec', 'Jan', 'Feb'],
      newRegs: [2100, 2650, 3240],
      activeUsers: [45000, 58000, 74563],
      totalNew: '7,990',
      trend: '+24.2%'
    }
  };

  const current = dataset[period];
  const maxVal = Math.max(...current.newRegs) * 1.25 || 1;
  const svgWidth = 540;
  const svgHeight = 170;
  const paddingX = 35;
  const paddingY = 20;

  const points = current.newRegs.map((val, idx) => {
    const x = paddingX + (idx / (current.newRegs.length - 1 || 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - paddingY * 2);
    return { x, y, val, label: current.labels[idx] };
  });

  const pathD = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>
              {current.totalNew}
            </span>
            <span className="admin-badge success" style={{ fontSize: '0.72rem' }}>
              <TrendingUp size={12} /> {current.trend}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
            New Brides & Grooms Onboarded
          </div>
        </div>

        <div className="admin-tab-bar">
          <button
            type="button"
            className={`admin-tab-btn ${period === '7d' ? 'active' : ''}`}
            onClick={() => setPeriod('7d')}
          >
            7 Days
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${period === '30d' ? 'active' : ''}`}
            onClick={() => setPeriod('30d')}
          >
            30 Days
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${period === '90d' ? 'active' : ''}`}
            onClick={() => setPeriod('90d')}
          >
            90 Days
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: '170px', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--admin-primary)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--admin-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line x1={paddingX} y1={svgHeight * 0.25} x2={svgWidth - paddingX} y2={svgHeight * 0.25} stroke="var(--admin-border-subtle)" strokeDasharray="4 4" />
          <line x1={paddingX} y1={svgHeight * 0.55} x2={svgWidth - paddingX} y2={svgHeight * 0.55} stroke="var(--admin-border-subtle)" strokeDasharray="4 4" />
          <line x1={paddingX} y1={svgHeight * 0.85} x2={svgWidth - paddingX} y2={svgHeight * 0.85} stroke="var(--admin-border-subtle)" strokeDasharray="4 4" />

          {/* Area */}
          <path d={areaD} fill="url(#regGrad)" />

          {/* Line Stroke */}
          <path d={pathD} fill="none" stroke="var(--admin-primary)" strokeWidth="3" strokeLinecap="round" />

          {/* Data Circles */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint === i ? 6 : 4}
                fill={hoveredPoint === i ? "var(--admin-gold)" : "var(--admin-primary)"}
                stroke="var(--admin-surface)"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {hoveredPoint === i && (
                <g>
                  <rect
                    x={pt.x - 36}
                    y={pt.y - 32}
                    width="72"
                    height="24"
                    rx="4"
                    fill="var(--admin-text-primary)"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 16}
                    textAnchor="middle"
                    fill="var(--admin-surface)"
                    fontSize="11"
                    fontWeight="700"
                  >
                    +{pt.val} regs
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: `0 ${paddingX}px`, marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>
        {current.labels.map((lbl, idx) => (
          <span key={idx}>{lbl}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * Interactive Donut Chart for Members by Plan
 */
export function PlanDonutChart() {
  const [activePlan, setActivePlan] = useState(null);

  const plans = [
    { label: 'Free Member', count: 122400, percent: 77, color: 'var(--admin-chart-free)' },
    { label: 'Gold Member', count: 18450, percent: 12, color: 'var(--admin-chart-gold)' },
    { label: 'Diamond Member', count: 12600, percent: 8, color: 'var(--admin-chart-diamond)' },
    { label: 'Telugu Elite VIP', count: 5282, percent: 3, color: 'var(--admin-chart-vip)' }
  ];

  const totalMembers = 158732;

  // SVG parameters
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
      {/* Donut graphic */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0, margin: '0 auto' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {plans.map((plan, idx) => {
            const strokeDasharray = `${(plan.percent / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += plan.percent;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={plan.color}
                strokeWidth={activePlan === idx ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                style={{
                  cursor: 'pointer',
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                  opacity: activePlan !== null && activePlan !== idx ? 0.45 : 1
                }}
                onMouseEnter={() => setActivePlan(idx)}
                onMouseLeave={() => setActivePlan(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            {activePlan !== null ? plans[activePlan].label : 'Total'}
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>
            {activePlan !== null ? `${plans[activePlan].percent}%` : '158.7K'}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {plans.map((p, i) => (
          <div
            key={i}
            onMouseEnter={() => setActivePlan(i)}
            onMouseLeave={() => setActivePlan(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: activePlan === i ? 'var(--admin-surface-hover)' : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: p.color,
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                {p.label}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>
                {p.percent}%
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginLeft: '4px' }}>
                ({p.count.toLocaleString()})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Interactive Revenue Bar Chart with active hover states and tooltips
 */
export function RevenueBarChart() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const data = [
    { label: 'Oct', amount: 32.4, fullAmount: '₹32,40,000', growth: '+8.2%' },
    { label: 'Nov', amount: 38.1, fullAmount: '₹38,10,000', growth: '+17.6%' },
    { label: 'Dec', amount: 41.5, fullAmount: '₹41,50,000', growth: '+8.9%' },
    { label: 'Jan', amount: 44.8, fullAmount: '₹44,80,000', growth: '+7.9%' },
    { label: 'Feb', amount: 48.75, fullAmount: '₹48,75,230', growth: '+14.6%' }
  ];

  const maxAmount = 55;
  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : data[data.length - 1];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>
            {activeItem.fullAmount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
            {activeItem.label}: {activeItem.growth} growth vs previous period
          </div>
        </div>
        <span className="admin-badge gold">Target Exceeded</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.75rem', height: '140px', paddingBottom: '0.5rem' }}>
        {data.map((item, idx) => {
          const heightPercent = (item.amount / maxAmount) * 100;
          const isSelected = hoveredIdx === idx || (hoveredIdx === null && idx === data.length - 1);

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                height: '100%',
                justifyContent: 'flex-end',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isSelected ? 'var(--admin-primary)' : 'var(--admin-text-muted)', transition: 'color 0.15s ease' }}>
                ₹{item.amount}L
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: '38px',
                  height: `${heightPercent}%`,
                  backgroundColor: isSelected ? 'var(--admin-primary)' : 'var(--admin-border)',
                  borderRadius: '6px 6px 2px 2px',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isSelected ? 'translateY(-3px)' : 'translateY(0)',
                  boxShadow: isSelected ? '0 4px 12px var(--admin-primary-tint)' : 'none'
                }}
                title={`${item.label}: ${item.fullAmount}`}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: isSelected ? 800 : 500, color: isSelected ? 'var(--admin-primary)' : 'var(--admin-text-muted)', transition: 'color 0.15s ease' }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Top Cities Demographics Progress Bar with hover highlighting
 */
export function CityDistributionBars() {
  const [hoveredCity, setHoveredCity] = useState(null);

  const cities = [
    { city: 'Hyderabad', percent: 42, count: '66,667 profiles', color: 'var(--admin-primary)' },
    { city: 'Vijayawada', percent: 21, count: '33,333 profiles', color: 'var(--admin-gold)' },
    { city: 'Visakhapatnam', percent: 18, count: '28,571 profiles', color: 'var(--admin-info)' },
    { city: 'Tirupati', percent: 11, count: '17,460 profiles', color: 'var(--admin-text-muted)' },
    { city: 'Guntur & Others', percent: 8, count: '12,701 profiles', color: 'var(--admin-text-disabled)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {cities.map((c, idx) => {
        const isHovered = hoveredCity === idx;

        return (
          <div
            key={idx}
            onMouseEnter={() => setHoveredCity(idx)}
            onMouseLeave={() => setHoveredCity(null)}
            style={{
              padding: '0.35rem 0.5rem',
              borderRadius: '8px',
              backgroundColor: isHovered ? 'var(--admin-surface-hover)' : 'transparent',
              transition: 'background-color 0.15s ease',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px' }}>
              <span style={{ color: isHovered ? 'var(--admin-primary)' : 'var(--admin-text-primary)' }}>{c.city}</span>
              <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
                {c.percent}% ({c.count})
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--admin-border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${c.percent}%`,
                  height: '100%',
                  backgroundColor: c.color,
                  borderRadius: '999px',
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease',
                  transform: isHovered ? 'scaleY(1.2)' : 'scaleY(1)'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Gender Ratio Split Widget
 */
export function GenderRatioWidget() {
  const malePercent = 54;
  const femalePercent = 46;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-info)' }}>
            {malePercent}%
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)', marginLeft: '4px' }}>
            Grooms (85,715)
          </span>
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-primary)' }}>
            {femalePercent}%
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)', marginLeft: '4px' }}>
            Brides (73,017)
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height: '14px', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
        <div
          style={{
            width: `${malePercent}%`,
            height: '100%',
            backgroundColor: 'var(--admin-info)',
            transition: 'width 0.3s ease'
          }}
          title={`Grooms: ${malePercent}%`}
        />
        <div
          style={{
            width: `${femalePercent}%`,
            height: '100%',
            backgroundColor: 'var(--admin-primary)',
            transition: 'width 0.3s ease'
          }}
          title={`Brides: ${femalePercent}%`}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.65rem', fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
        <span>Balanced matrimonial matching ratio</span>
        <span style={{ fontWeight: 700, color: 'var(--admin-success)' }}>Optimal Pool</span>
      </div>
    </div>
  );
}
