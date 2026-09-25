import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  ShoppingCart,
  Percent,
  DollarSign,
  Activity,
  Compass,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { AnalyticsSummary, Product, Order } from '../types';
import { generateExecutiveSalesReportPDF } from '../services/pdfReportGenerator';

interface AnalyticsDashboardProps {
  analytics: AnalyticsSummary;
  products: Product[];
  orders: Order[];
  currencySymbol: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
  products,
  orders,
  currencySymbol,
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    setTimeout(() => {
      generateExecutiveSalesReportPDF(analytics, products, orders);
      setIsExportingPDF(false);
    }, 600);
  };

  // Find maximum revenue for scaling chart bars
  const maxDailyRevenue = Math.max(...analytics.dailyMetrics.map((d) => d.revenue), 100);

  return (
    <div id="analytics-dashboard-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Top Header & Export PDF CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Executive Business Intelligence
            </span>
            <span className="text-xs text-zinc-500 font-mono">Live Aggregation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1 tracking-tight">
            Sales Performance &amp; Engagement Metrics
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Tracking multi-category sales volume, net margin economics, user session conversions, and PDF reports.
          </p>
        </div>

        {/* PDF Export Button */}
        <button
          id="export-executive-pdf-btn"
          onClick={handleExportPDF}
          disabled={isExportingPDF}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs shadow-xl shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExportingPDF ? 'Generating Document...' : 'Export Executive PDF Report'}</span>
        </button>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Gross Sales Volume</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {currencySymbol}{analytics.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs previous 30d</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Est. Net Profit</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
            {currencySymbol}{analytics.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
            <span className="text-emerald-400 font-bold">
              {Math.round((analytics.netProfit / (analytics.grossRevenue || 1)) * 100)}%
            </span>
            <span>operating margin</span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Avg Order Value (AOV)</span>
            <ShoppingCart className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {currencySymbol}{analytics.averageOrderValue.toFixed(2)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
            <span>{analytics.totalOrders} paid transactions</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Checkout Conversion</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-display">
            {analytics.conversionRate}%
          </p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
            <span className="text-emerald-400 font-bold">+0.8%</span>
            <span>above luxury median</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Sales Performance Chart & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Sales Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-display">
                7-Day Revenue &amp; Transaction Velocity
              </h3>
              <p className="text-xs text-zinc-400">Daily performance aggregated across all boutique departments</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Revenue ($)</span>
            </div>
          </div>

          {/* Interactive Responsive Bar Chart */}
          <div className="pt-4 pb-2">
            <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {analytics.dailyMetrics.map((day, idx) => {
                const heightPct = Math.max(8, Math.round((day.revenue / maxDailyRevenue) * 100));
                const dateLabel = new Date(day.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'numeric',
                  day: 'numeric',
                });

                return (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDayIdx(idx)}
                    onMouseLeave={() => setHoveredDayIdx(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div
                      className={`mb-2 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-[10px] text-white shadow-xl transition-opacity duration-200 whitespace-nowrap pointer-events-none ${
                        hoveredDayIdx === idx ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <p className="font-bold text-amber-400">{currencySymbol}{day.revenue.toFixed(2)}</p>
                      <p className="text-zinc-400">{day.orders} orders • {day.visitors} visits</p>
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[48px] bg-zinc-800/80 rounded-t-xl overflow-hidden flex flex-col justify-end transition-all group-hover:bg-zinc-700">
                      <div
                        className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>

                    {/* X-axis Label */}
                    <span className="text-[10px] text-zinc-400 group-hover:text-white mt-2 font-mono">
                      {dateLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Share Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-base font-bold text-white font-display">
              Category Revenue Share
            </h3>
            <p className="text-xs text-zinc-400">Contribution by department catalog</p>
          </div>

          <div className="space-y-4 pt-2">
            {analytics.categoryMetrics.map((cat) => (
              <div key={cat.category} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-200">{cat.displayName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400">{currencySymbol}{cat.revenue.toLocaleString()}</span>
                    <span className="font-bold text-amber-400">{cat.share}%</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            <p className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Insight: Eyewear yields highest net margin per cubic volume.</span>
            </p>
          </div>
        </div>
      </div>

      {/* User Engagement & Acquisition Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live Visitor & Session Metrics */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              Real-time Store Visitors
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
              LIVE
            </span>
          </div>

          <div className="pt-2">
            <span className="text-4xl font-extrabold text-white font-display">
              {analytics.activeVisitors}
            </span>
            <span className="text-xs text-zinc-400 ml-2">concurrent shoppers on storefront</span>
          </div>

          <div className="space-y-2 pt-2 text-xs text-zinc-400 border-t border-zinc-800/80">
            <div className="flex justify-between">
              <span>Avg Session Duration:</span>
              <strong className="text-zinc-200">4m 38s</strong>
            </div>
            <div className="flex justify-between">
              <span>Pages per Session:</span>
              <strong className="text-zinc-200">5.2 views</strong>
            </div>
            <div className="flex justify-between">
              <span>Bounce Rate:</span>
              <strong className="text-emerald-400">24.1% (Low)</strong>
            </div>
          </div>
        </div>

        {/* Cart Abandonment & Retention */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              Cart Health &amp; Retention
            </h3>
            <span className="text-xs font-mono text-zinc-400">30-Day Avg</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Abandonment</span>
              <span className="text-2xl font-bold text-zinc-200 font-display">
                {analytics.cartAbandonmentRate}%
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">&darr; 4.2% optimized</span>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Repeat Buyers</span>
              <span className="text-2xl font-bold text-zinc-200 font-display">
                {analytics.repeatCustomerRate}%
              </span>
              <span className="text-[10px] text-sky-400 block mt-0.5">High Brand Loyalty</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 pt-1">
            Free shipping threshold ($300) reduced cart drop-off by 12% across high-ticket apparel.
          </p>
        </div>

        {/* Traffic Channels */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" />
              Acquisition Channels
            </h3>
            <span className="text-xs font-mono text-zinc-400">Source Share</span>
          </div>

          <div className="space-y-2.5 pt-2">
            {analytics.trafficSources.map((source) => (
              <div key={source.source} className="space-y-1 text-xs">
                <div className="flex justify-between text-zinc-300">
                  <span className="truncate pr-2">{source.source}</span>
                  <span className="font-bold text-white">{source.percentage}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
