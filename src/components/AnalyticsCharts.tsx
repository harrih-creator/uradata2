import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  Building2, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { DeveloperSaleRecord, SINGAPORE_MARKET_SUMMARY } from '../data/developerSalesData';

interface AnalyticsChartsProps {
  projects: DeveloperSaleRecord[];
  onSelectProject: (project: DeveloperSaleRecord) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ projects, onSelectProject }) => {
  // Aggregate by Segment
  const segmentStats: Record<string, { count: number; launched: number; sold: number; monthly: number; totalPsf: number; minPsf: number; maxPsf: number }> = {
    CCR: { count: 0, launched: 0, sold: 0, monthly: 0, totalPsf: 0, minPsf: Infinity, maxPsf: 0 },
    RCR: { count: 0, launched: 0, sold: 0, monthly: 0, totalPsf: 0, minPsf: Infinity, maxPsf: 0 },
    OCR: { count: 0, launched: 0, sold: 0, monthly: 0, totalPsf: 0, minPsf: Infinity, maxPsf: 0 },
    EC: { count: 0, launched: 0, sold: 0, monthly: 0, totalPsf: 0, minPsf: Infinity, maxPsf: 0 },
  };

  projects.forEach((p) => {
    const seg = p.propertyType === 'Executive Condominium' ? 'EC' : p.marketSegment;
    if (segmentStats[seg]) {
      segmentStats[seg].count++;
      segmentStats[seg].launched += p.unitsLaunched;
      segmentStats[seg].sold += p.unitsSold;
      segmentStats[seg].monthly += p.soldThisMonth;
      segmentStats[seg].totalPsf += p.medianPrice;
      segmentStats[seg].minPsf = Math.min(segmentStats[seg].minPsf, p.minPrice);
      segmentStats[seg].maxPsf = Math.max(segmentStats[seg].maxPsf, p.maxPrice);
    }
  });

  // Top 10 Best Sellers of the Reference Month
  const topSellers = [...projects]
    .sort((a, b) => b.soldThisMonth - a.soldThisMonth)
    .slice(0, 10);

  // Highest PSF projects
  const highestPsfProjects = [...projects]
    .sort((a, b) => b.medianPrice - a.medianPrice)
    .slice(0, 8);

  const maxMonthly = Math.max(...topSellers.map((p) => p.soldThisMonth), 1);
  const maxPsf = Math.max(...highestPsfProjects.map((p) => p.medianPrice), 1);

  return (
    <div className="space-y-6">
      {/* Segment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['CCR', 'RCR', 'OCR', 'EC'] as const).map((seg) => {
          const stats = segmentStats[seg];
          const avgPsf = stats.count > 0 ? Math.round(stats.totalPsf / stats.count) : 0;
          const takeUp = stats.launched > 0 ? Math.round((stats.sold / stats.launched) * 100) : 0;
          const info = SINGAPORE_MARKET_SUMMARY[seg];

          return (
            <div
              key={seg}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg relative overflow-hidden"
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: info?.accentColor || '#3B82F6' }}
              />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {seg} Segment
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {stats.count} Projects
                </span>
              </div>

              <div className="text-xl font-bold font-mono text-white mt-1">
                ${avgPsf.toLocaleString()} <span className="text-xs text-slate-400 font-normal">avg PSF</span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Monthly Transactions:</span>
                  <span className="text-emerald-400 font-mono font-medium">+{stats.monthly} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Cumulative Take-up:</span>
                  <span className="text-indigo-400 font-mono font-medium">{takeUp}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Sold / Stock:</span>
                  <span className="text-slate-300 font-mono">{stats.sold} / {stats.launched}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: info?.accentColor || '#3B82F6',
                    width: `${Math.min(takeUp, 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Best Sellers Chart */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Top Sales Velocity of the Month
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Highest number of options to purchase (OTPs) issued in refPeriod
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Units Sold
            </span>
          </div>

          <div className="space-y-3">
            {topSellers.map((item, idx) => {
              const widthPct = Math.round((item.soldThisMonth / maxMonthly) * 100);
              const segment = SINGAPORE_MARKET_SUMMARY[item.marketSegment];

              return (
                <div
                  key={item.project}
                  onClick={() => onSelectProject(item)}
                  className="group cursor-pointer p-2 rounded-xl hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 truncate max-w-[240px] sm:max-w-[300px]">
                      <span className="font-mono text-slate-500 w-4 font-bold">{idx + 1}.</span>
                      <span className="font-semibold text-white group-hover:text-indigo-300 transition truncate">
                        {item.project}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.2 rounded text-white shrink-0"
                        style={{ backgroundColor: segment?.accentColor || '#3B82F6' }}
                      >
                        {item.marketSegment}
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-400">
                      +{item.soldThisMonth} units <span className="text-slate-500 font-normal">(${item.medianPrice} psf)</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top PSF Benchmark Chart */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                Highest PSF Benchmark Projects
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Luxury & prime transacted price per square foot (SGD)
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Median PSF
            </span>
          </div>

          <div className="space-y-3">
            {highestPsfProjects.map((item, idx) => {
              const widthPct = Math.round((item.medianPrice / maxPsf) * 100);

              return (
                <div
                  key={item.project}
                  onClick={() => onSelectProject(item)}
                  className="group cursor-pointer p-2 rounded-xl hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 truncate max-w-[240px] sm:max-w-[300px]">
                      <span className="font-mono text-slate-500 w-4 font-bold">{idx + 1}.</span>
                      <span className="font-semibold text-white group-hover:text-indigo-300 transition truncate">
                        {item.project}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.district.split(' ')[0]}
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold text-indigo-400">
                      ${item.medianPrice.toLocaleString()} <span className="text-slate-500 font-normal">PSF</span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full transition-all duration-300"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
