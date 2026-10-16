import React from 'react';
import { 
  Building2, 
  MapPin, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DeveloperSaleRecord, SINGAPORE_MARKET_SUMMARY } from '../data/developerSalesData';

export type SortField = 'project' | 'unitsSold' | 'takeUp' | 'medianPrice' | 'soldThisMonth' | 'unsoldUnits';
export type SortDirection = 'asc' | 'desc';

interface ProjectsTableProps {
  projects: DeveloperSaleRecord[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectProject: (project: DeveloperSaleRecord) => void;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  sortField,
  sortDirection,
  onSort,
  onSelectProject,
}) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-400 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-400 ml-1 inline" />
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
          <tr>
            <th 
              className="py-3.5 px-4 cursor-pointer hover:text-white transition group"
              onClick={() => onSort('project')}
            >
              Development Project {renderSortIcon('project')}
            </th>
            <th className="py-3.5 px-3">Segment</th>
            <th className="py-3.5 px-3">Developer</th>
            <th 
              className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition group"
              onClick={() => onSort('soldThisMonth')}
            >
              Month Sales {renderSortIcon('soldThisMonth')}
            </th>
            <th 
              className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition group"
              onClick={() => onSort('takeUp')}
            >
              Take-up {renderSortIcon('takeUp')}
            </th>
            <th 
              className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition group"
              onClick={() => onSort('unitsSold')}
            >
              Sold / Launched {renderSortIcon('unitsSold')}
            </th>
            <th 
              className="py-3.5 px-3 text-right cursor-pointer hover:text-white transition group"
              onClick={() => onSort('unsoldUnits')}
            >
              Unsold {renderSortIcon('unsoldUnits')}
            </th>
            <th 
              className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition group"
              onClick={() => onSort('medianPrice')}
            >
              Median PSF {renderSortIcon('medianPrice')}
            </th>
            <th className="py-3.5 px-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-normal">
          {projects.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-12 text-center text-slate-400">
                No developments match the current search & filters.
              </td>
            </tr>
          ) : (
            projects.map((proj) => {
              const takeUp = proj.unitsLaunched > 0 
                ? Math.round((proj.unitsSold / proj.unitsLaunched) * 100) 
                : 0;
              const segment = SINGAPORE_MARKET_SUMMARY[proj.marketSegment];

              return (
                <tr
                  key={`${proj.project}-${proj.street}`}
                  onClick={() => onSelectProject(proj)}
                  className="hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  {/* Project & Address */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white group-hover:text-indigo-300 transition flex items-center gap-1.5">
                      {proj.project}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[260px]">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      {proj.street}
                      <span className="text-slate-500">•</span>
                      <span className="font-mono text-slate-400">{proj.district.split(' ')[0]}</span>
                    </div>
                  </td>

                  {/* Segment Badge */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider text-white"
                      style={{ backgroundColor: segment?.accentColor || '#3B82F6' }}
                    >
                      {proj.marketSegment}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[90px]">
                      {proj.propertyType === 'Executive Condominium' ? 'EC' : proj.propertyType}
                    </div>
                  </td>

                  {/* Developer */}
                  <td className="py-3.5 px-3 text-xs text-slate-300 truncate max-w-[180px]">
                    {proj.developer}
                  </td>

                  {/* Month sales */}
                  <td className="py-3.5 px-3 text-right font-mono font-medium text-emerald-400">
                    +{proj.soldThisMonth}
                  </td>

                  {/* Take-up Rate */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-mono text-xs font-semibold text-slate-200">
                      {takeUp}%
                    </div>
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          takeUp >= 90 
                            ? 'bg-emerald-500' 
                            : takeUp >= 60 
                            ? 'bg-indigo-500' 
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(takeUp, 100)}%` }}
                      />
                    </div>
                  </td>

                  {/* Sold / Launched */}
                  <td className="py-3.5 px-3 text-right font-mono text-xs whitespace-nowrap">
                    <span className="font-semibold text-white">{proj.unitsSold}</span>
                    <span className="text-slate-500"> / {proj.unitsLaunched}</span>
                  </td>

                  {/* Unsold Balance */}
                  <td className="py-3.5 px-3 text-right font-mono text-xs">
                    <span className={`font-semibold ${proj.unsoldUnits <= 10 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {proj.unsoldUnits}
                    </span>
                  </td>

                  {/* Median PSF */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="font-mono font-bold text-sm text-indigo-400">
                      ${proj.medianPrice.toLocaleString()}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                      ${proj.minPrice} - ${proj.maxPrice}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(proj);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="View Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
