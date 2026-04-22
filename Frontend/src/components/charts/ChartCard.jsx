/**
 * Chart Card Component — Premium financial charts using Recharts
 * Supports: bar, line, pie, area, donut
 */

import React, { memo, useState } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';

const PALETTE = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
];

const ChartCard = memo(({ chartData }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  if (!chartData) return null;

  // Normalise type
  const type = (chartData.type || 'bar').toLowerCase();

  // Build Recharts data array
  const data = chartData.labels.map((label, idx) => {
    const point = { name: label };
    (chartData.datasets || []).forEach(ds => {
      point[ds.label] = Number(ds.data?.[idx] ?? 0);
    });
    return point;
  });

  // Pie / Donut data — flat
  const pieData = chartData.labels.map((label, idx) => ({
    name: label,
    value: Number((chartData.datasets?.[0]?.data?.[idx]) ?? 0)
  }));

  const iconMap = {
    bar: BarChart3, line: TrendingUp, pie: PieIcon,
    donut: PieIcon, area: Activity
  };
  const Icon = iconMap[type] || BarChart3;

  const tooltipStyle = {
    backgroundColor: 'rgba(15,23,42,0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  };

  const axisStyle = { fontSize: 11, fill: '#94a3b8' };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {(chartData.datasets || []).map((ds, i) => (
              <Line key={i} type="monotone" dataKey={ds.label}
                stroke={ds.color || PALETTE[i % PALETTE.length]}
                strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }}
                activeDot={{ r: 7 }} isAnimationActive={false} />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              {(chartData.datasets || []).map((ds, i) => (
                <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ds.color || PALETTE[i % PALETTE.length]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={ds.color || PALETTE[i % PALETTE.length]} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {(chartData.datasets || []).map((ds, i) => (
              <Area key={i} type="monotone" dataKey={ds.label}
                stroke={ds.color || PALETTE[i % PALETTE.length]}
                fill={`url(#grad${i})`} strokeWidth={2.5}
                isAnimationActive={false} />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {(chartData.datasets || []).map((ds, i) => (
              <Bar key={i} dataKey={ds.label}
                fill={ds.color || PALETTE[i % PALETTE.length]}
                radius={[6, 6, 0, 0]} isAnimationActive={false} />
            ))}
          </BarChart>
        );

      case 'pie':
      case 'donut': {
        const innerR = type === 'donut' ? 60 : 0;
        return (
          <PieChart>
            <Pie
              data={pieData} cx="50%" cy="50%"
              innerRadius={innerR} outerRadius={110}
              paddingAngle={3} dataKey="value"
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              isAnimationActive={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((_, idx) => (
                <Cell key={idx}
                  fill={PALETTE[idx % PALETTE.length]}
                  opacity={activeIndex === null || activeIndex === idx ? 1 : 0.5}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle}
              formatter={(v) => [v.toLocaleString(), 'Value']} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        );
      }

      default:
        return <div className="text-sm text-gray-400 text-center py-8">Unsupported chart type: {type}</div>;
    }
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-gray-200/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Icon className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {chartData.title || 'Financial Chart'}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{type} chart • {data.length} data points</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 uppercase tracking-wide">
          {type}
        </span>
      </div>

      {/* Chart */}
      <div className="px-4 py-5">
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Data table preview */}
      {data.length <= 8 && data.length >= 2 && (
        <div className="px-5 pb-4">
          <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/5">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5">
                  <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400 font-medium">Label</th>
                  {(chartData.datasets || []).map((ds, i) => (
                    <th key={i} className="text-right px-3 py-2 font-medium" style={{ color: ds.color || PALETTE[i] }}>
                      {ds.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-t border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/3">
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.name}</td>
                    {(chartData.datasets || []).map((ds, j) => (
                      <td key={j} className="px-3 py-2 text-right text-gray-900 dark:text-white font-mono font-medium">
                        {typeof row[ds.label] === 'number' ? row[ds.label].toLocaleString() : row[ds.label]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

ChartCard.displayName = 'ChartCard';
export default ChartCard;
