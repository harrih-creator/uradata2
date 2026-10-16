import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { DeveloperSaleRecord, SINGAPORE_MARKET_SUMMARY } from '../data/developerSalesData';

interface ProjectDetailModalProps {
  project: DeveloperSaleRecord | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  const [copiedJson, setCopiedJson] = useState(false);

  if (!project) return null;

  const takeUpRate = project.unitsLaunched > 0 
    ? Math.round((project.unitsSold / project.unitsLaunched) * 100)
    : 0;

  const overallSoldRate = project.totUnits > 0
    ? Math.round((project.unitsSold / project.totUnits) * 100)
    : 0;

  const segmentInfo = SINGAPORE_MARKET_SUMMARY[project.marketSegment] || {
    name: project.marketSegment,
    description: '',
    typicalRange: '',
    accentColor: '#3B82F6',
  };

  const copyRecordJson = () => {
    navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Estimated indicative unit quantums based on median PSF
  const est2BR = Math.round((project.medianPrice * 680) / 1000) * 1000;
  const est3BR = Math.round((project.medianPrice * 950) / 1000) * 1000;
  const est4BR = Math.round((project.medianPrice * 1350) / 1000) * 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-8">
        {/* Header Banner */}
        <div className="relative p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span 
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white"
              style={{ backgroundColor: segmentInfo.accentColor }}
            >
              {project.marketSegment}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              {project.propertyType}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {project.district}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            {project.project}
          </h2>
          <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            {project.street}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Developer & Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-800 gap-3">
            <div>
              <div className="text-xs text-slate-400">Master Developer / Joint Venture</div>
              <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                {project.developer}
              </div>
            </div>
            <div className="flex gap-4 sm:text-right">
              <div>
                <div className="text-xs text-slate-400">Tenure</div>
                <div className="text-sm font-medium text-slate-200 mt-0.5">{project.tenure}</div>
              </div>
              {project.expectedTOP && (
                <div>
                  <div className="text-xs text-slate-400">Estimated TOP</div>
                  <div className="text-sm font-medium text-slate-200 mt-0.5">{project.expectedTOP}</div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Spectrum */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Developer Pricing Spectrum (Per Square Foot - PSF SGD)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-medium">Minimum PSF</span>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                  ${project.minPrice.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center">
                <span className="text-[11px] text-indigo-300 uppercase font-medium">Median Transacted PSF</span>
                <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                  ${project.medianPrice.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-medium">Maximum PSF</span>
                <div className="text-lg font-bold font-mono text-rose-400 mt-1">
                  ${project.maxPrice.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory & Take-up Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Launch Take-up & Inventory Absorption
              </h3>
              <span className="text-xs font-mono font-semibold text-emerald-400">
                {takeUpRate}% of Launched Units Sold
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(takeUpRate, 100)}%` }}
              ></div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-[11px] text-slate-400">Total Project Units</div>
                <div className="text-base font-bold font-mono text-slate-100 mt-1">
                  {project.totUnits}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-[11px] text-slate-400">Units Launched</div>
                <div className="text-base font-bold font-mono text-indigo-400 mt-1">
                  {project.unitsLaunched}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-[11px] text-slate-400">Cumulative Units Sold</div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                  {project.unitsSold}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-[11px] text-slate-400">Unsold Balance Stock</div>
                <div className="text-base font-bold font-mono text-amber-400 mt-1">
                  {project.unsoldUnits}
                </div>
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between px-1">
              <span>Sold in Reference Month ({project.refPeriod}): <strong className="text-white font-mono">{project.soldThisMonth} units</strong></span>
              <span>Total Absorption Rate: <strong className="text-white font-mono">{overallSoldRate}%</strong></span>
            </div>
          </div>

          {/* Indicative Price Quantums */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Indicative Purchase Quantums (Estimated at Median ${project.medianPrice} PSF)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400">Typical 2-Bedroom (~680 sqft)</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  ~${(est2BR / 1000000).toFixed(2)}M SGD
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400">Typical 3-Bedroom (~950 sqft)</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  ~${(est3BR / 1000000).toFixed(2)}M SGD
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400">Typical 4-Bedroom (~1,350 sqft)</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  ~${(est4BR / 1000000).toFixed(2)}M SGD
                </div>
              </div>
            </div>
          </div>

          {/* Raw URA Data Record */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Raw URA DataService JSON Record:
              </span>
              <button
                onClick={copyRecordJson}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
              >
                {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedJson ? 'Copied' : 'Copy Record'}
              </button>
            </div>
            <pre className="font-mono text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 max-h-40 overflow-y-auto">
              {JSON.stringify(project, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400">
            Source: URA Private Market Information (PMI_Resi_Developer_Sales)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
