import React from 'react';
import { Building2, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import { DeveloperSaleRecord } from '../data/developerSalesData';

interface DeveloperLeaderboardProps {
  projects: DeveloperSaleRecord[];
  onSelectProject: (project: DeveloperSaleRecord) => void;
}

interface DeveloperAgg {
  developer: string;
  projectCount: number;
  totalLaunched: number;
  totalSold: number;
  monthlySales: number;
  totalUnsold: number;
  avgPsf: number;
  projects: DeveloperSaleRecord[];
}

export const DeveloperLeaderboard: React.FC<DeveloperLeaderboardProps> = ({ projects, onSelectProject }) => {
  // Aggregate data by developer
  const devMap: Record<string, DeveloperAgg> = {};

  projects.forEach((p) => {
    // Simplify developer name for grouping
    let devKey = p.developer;
    if (devKey.includes('City Developments') || devKey.includes('CDL')) devKey = 'City Developments Limited (CDL)';
    else if (devKey.includes('Sim Lian')) devKey = 'Sim Lian Group';
    else if (devKey.includes('Kingsford')) devKey = 'Kingsford Development';
    else if (devKey.includes('Far East')) devKey = 'Far East Organization';
    else if (devKey.includes('Hoi Hup')) devKey = 'Hoi Hup Realty & Sunway';
    else if (devKey.includes('Qingjian')) devKey = 'Qingjian Realty';
    else if (devKey.includes('TID')) devKey = 'TID Pte. Ltd.';

    if (!devMap[devKey]) {
      devMap[devKey] = {
        developer: devKey,
        projectCount: 0,
        totalLaunched: 0,
        totalSold: 0,
        monthlySales: 0,
        totalUnsold: 0,
        avgPsf: 0,
        projects: [],
      };
    }

    const d = devMap[devKey];
    d.projectCount++;
    d.totalLaunched += p.unitsLaunched;
    d.totalSold += p.unitsSold;
    d.monthlySales += p.soldThisMonth;
    d.totalUnsold += p.unsoldUnits;
    d.avgPsf += p.medianPrice;
    d.projects.push(p);
  });

  const developerList = Object.values(devMap).map((d) => ({
    ...d,
    avgPsf: Math.round(d.avgPsf / d.projectCount),
    takeUpRate: d.totalLaunched > 0 ? Math.round((d.totalSold / d.totalLaunched) * 100) : 0,
  }));

  // Sort by monthly sales volume desc
  developerList.sort((a, b) => b.monthlySales - a.monthlySales);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Developer Market Share & Performance Leaderboard
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by total residential units sold in the reference period
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {developerList.length} Active Developers
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {developerList.map((dev, idx) => (
          <div
            key={dev.developer}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/80 transition shadow-lg"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-xs">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm tracking-tight">
                    {dev.developer}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {dev.projectCount} active {dev.projectCount === 1 ? 'development' : 'developments'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-emerald-400">
                  +{dev.monthlySales} units
                </div>
                <div className="text-[10px] text-slate-500 uppercase">This Month</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center my-3">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Avg Transacted PSF</div>
                <div className="text-sm font-bold font-mono text-indigo-400 mt-0.5">
                  ${dev.avgPsf.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Cumulative Sold</div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {dev.totalSold}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Portfolio Take-up</div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  {dev.takeUpRate}%
                </div>
              </div>
            </div>

            {/* Active Projects Pills */}
            <div className="space-y-1.5 mt-3">
              <div className="text-[11px] font-medium text-slate-400">Associated Developments:</div>
              <div className="flex flex-wrap gap-1.5">
                {dev.projects.map((p) => (
                  <button
                    key={p.project}
                    onClick={() => onSelectProject(p)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-200 border border-slate-700 text-slate-300 transition flex items-center gap-1.5"
                  >
                    <span>{p.project}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">+{p.soldThisMonth}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
