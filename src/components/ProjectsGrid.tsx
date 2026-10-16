import React from 'react';
import { 
  Building2, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { DeveloperSaleRecord, SINGAPORE_MARKET_SUMMARY } from '../data/developerSalesData';

interface ProjectsGridProps {
  projects: DeveloperSaleRecord[];
  onSelectProject: (project: DeveloperSaleRecord) => void;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects, onSelectProject }) => {
  if (projects.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 rounded-2xl border border-slate-800 bg-slate-900/50">
        No developments match the current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((proj) => {
        const takeUp = proj.unitsLaunched > 0
          ? Math.round((proj.unitsSold / proj.unitsLaunched) * 100)
          : 0;
        const segment = SINGAPORE_MARKET_SUMMARY[proj.marketSegment];

        return (
          <div
            key={`${proj.project}-${proj.street}`}
            onClick={() => onSelectProject(proj)}
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/5 flex flex-col justify-between"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white"
                    style={{ backgroundColor: segment?.accentColor || '#3B82F6' }}
                  >
                    {proj.marketSegment}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80">
                    {proj.propertyType === 'Executive Condominium' ? 'EC' : proj.propertyType}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {proj.district.split(' ')[0]}
                </span>
              </div>

              {/* Title & Street */}
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition tracking-tight">
                {proj.project}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                {proj.street}
              </p>

              {/* Developer */}
              <p className="text-xs text-slate-400 mt-2 truncate flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                {proj.developer}
              </p>

              {/* Pricing Box */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Median Transacted</div>
                  <div className="text-lg font-bold font-mono text-indigo-400">
                    ${proj.medianPrice.toLocaleString()} <span className="text-xs text-slate-400 font-normal">PSF</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">PSF Spread</div>
                  <div className="text-xs font-mono text-slate-300">
                    ${proj.minPrice} - ${proj.maxPrice}
                  </div>
                </div>
              </div>

              {/* Take-up Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Absorption Rate:</span>
                  <span className="font-mono font-semibold text-emerald-400">{takeUp}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      takeUp >= 90
                        ? 'bg-emerald-500'
                        : takeUp >= 60
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(takeUp, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Sold: <strong className="text-slate-200 font-mono">{proj.unitsSold}</strong>/{proj.unitsLaunched}</span>
                  <span>Unsold: <strong className="text-amber-400 font-mono">{proj.unsoldUnits}</strong></span>
                </div>
              </div>
            </div>

            {/* Bottom Footer Details */}
            <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate max-w-[150px]">{proj.tenure}</span>
              <span className="font-mono text-emerald-400 font-medium">+{proj.soldThisMonth} this month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
