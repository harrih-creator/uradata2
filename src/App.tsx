/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Terminal, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Table as TableIcon, 
  LayoutGrid, 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Calendar, 
  ExternalLink, 
  Check, 
  Copy,
  ChevronDown,
  Info,
  SlidersHorizontal,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { 
  DeveloperSaleRecord, 
  PRELOADED_DEVELOPER_SALES, 
  PERIOD_LABELS, 
  SINGAPORE_MARKET_SUMMARY 
} from './data/developerSalesData';
import { ProjectsTable, SortField, SortDirection } from './components/ProjectsTable';
import { ProjectsGrid } from './components/ProjectsGrid';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { DeveloperLeaderboard } from './components/DeveloperLeaderboard';
import { ApiConsoleModal } from './components/ApiConsoleModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';

export default function App() {
  // Reference Period & Credentials state
  const [refPeriod, setRefPeriod] = useState<string>('0826');
  const [accessKey, setAccessKey] = useState<string>('accesskey');
  const [token, setToken] = useState<string>('token');
  const [isLiveApiData, setIsLiveApiData] = useState<boolean>(false);
  const [liveRecords, setLiveRecords] = useState<DeveloperSaleRecord[] | null>(null);

  // UI View Modes
  const [activeTab, setActiveTab] = useState<'table' | 'grid' | 'analytics' | 'developers'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('soldThisMonth');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modals
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<DeveloperSaleRecord | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Active records: live if provided, else benchmark preloaded data
  const baseRecords: DeveloperSaleRecord[] = useMemo(() => {
    if (isLiveApiData && liveRecords && liveRecords.length > 0) {
      return liveRecords;
    }
    return PRELOADED_DEVELOPER_SALES[refPeriod] || PRELOADED_DEVELOPER_SALES['0826'];
  }, [isLiveApiData, liveRecords, refPeriod]);

  // Extract unique districts
  const districts = useMemo(() => {
    const set = new Set<string>();
    baseRecords.forEach((r) => {
      const code = r.district.split(' ')[0];
      set.add(code);
    });
    return Array.from(set).sort();
  }, [baseRecords]);

  // Filtered & Sorted Records
  const filteredProjects = useMemo(() => {
    return baseRecords
      .filter((proj) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchProject = proj.project.toLowerCase().includes(q);
          const matchStreet = proj.street.toLowerCase().includes(q);
          const matchDeveloper = proj.developer.toLowerCase().includes(q);
          const matchDistrict = proj.district.toLowerCase().includes(q);
          if (!matchProject && !matchStreet && !matchDeveloper && !matchDistrict) {
            return false;
          }
        }

        // Market segment filter
        if (selectedSegment !== 'ALL') {
          if (selectedSegment === 'EC') {
            if (proj.propertyType !== 'Executive Condominium') return false;
          } else {
            if (proj.marketSegment !== selectedSegment) return false;
          }
        }

        // District filter
        if (selectedDistrict !== 'ALL') {
          if (!proj.district.startsWith(selectedDistrict)) return false;
        }

        // Property type filter
        if (selectedPropertyType !== 'ALL') {
          if (proj.propertyType !== selectedPropertyType) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;

        if (sortField === 'takeUp') {
          valA = a.unitsLaunched > 0 ? a.unitsSold / a.unitsLaunched : 0;
          valB = b.unitsLaunched > 0 ? b.unitsSold / b.unitsLaunched : 0;
        } else {
          valA = a[sortField];
          valB = b[sortField];
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [baseRecords, searchQuery, selectedSegment, selectedDistrict, selectedPropertyType, sortField, sortDirection]);

  // Executive Aggregate KPIs
  const stats = useMemo(() => {
    const totalProjects = baseRecords.length;
    const totalLaunched = baseRecords.reduce((acc, p) => acc + p.unitsLaunched, 0);
    const totalSold = baseRecords.reduce((acc, p) => acc + p.unitsSold, 0);
    const totalUnsold = baseRecords.reduce((acc, p) => acc + p.unsoldUnits, 0);
    const monthlySales = baseRecords.reduce((acc, p) => acc + p.soldThisMonth, 0);
    const avgPsf = totalProjects > 0
      ? Math.round(baseRecords.reduce((acc, p) => acc + p.medianPrice, 0) / totalProjects)
      : 0;
    const overallTakeUp = totalLaunched > 0 ? Math.round((totalSold / totalLaunched) * 100) : 0;

    // Top seller
    const sortedByMonth = [...baseRecords].sort((a, b) => b.soldThisMonth - a.soldThisMonth);
    const topSeller = sortedByMonth[0] || null;

    return {
      totalProjects,
      totalLaunched,
      totalSold,
      totalUnsold,
      monthlySales,
      avgPsf,
      overallTakeUp,
      topSeller,
    };
  }, [baseRecords]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Project',
      'Street',
      'Market Segment',
      'Developer',
      'Property Type',
      'District',
      'Total Units',
      'Units Launched',
      'Units Sold',
      'Unsold Units',
      'Sold This Month',
      'Median PSF (SGD)',
      'Min PSF',
      'Max PSF',
      'Tenure',
      'Ref Period',
    ];

    const rows = filteredProjects.map((p) => [
      `"${p.project}"`,
      `"${p.street}"`,
      p.marketSegment,
      `"${p.developer}"`,
      `"${p.propertyType}"`,
      `"${p.district}"`,
      p.totUnits,
      p.unitsLaunched,
      p.unitsSold,
      p.unsoldUnits,
      p.soldThisMonth,
      p.medianPrice,
      p.minPrice,
      p.maxPrice,
      `"${p.tenure}"`,
      p.refPeriod,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `URA_Developer_Sales_${refPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Exported CSV file successfully!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Navigation & Brand Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Singapore URA Developer Sales
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                  PMI_Resi_Developer_Sales
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Urban Redevelopment Authority Private Residential Intelligence Platform
              </p>
            </div>
          </div>

          {/* Quick Controls & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Period Selector Dropdown */}
            <div className="relative">
              <select
                value={refPeriod}
                onChange={(e) => {
                  setRefPeriod(e.target.value);
                  setIsLiveApiData(false);
                }}
                className="bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-200 rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
              >
                <option value="0826">Period: 0826 (August 2026)</option>
                <option value="0926">Period: 0926 (September 2026)</option>
                <option value="0726">Period: 0726 (July 2026)</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Live API Console Modal Trigger */}
            <button
              onClick={() => setIsConsoleOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-md shadow-indigo-600/20"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>cURL Terminal & API</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs transition shadow-sm"
              title="Export Current View to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner with cURL Quick Info */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/30 border border-slate-800/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Target Endpoint Active
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400">
                Period: <strong className="text-white font-mono">{PERIOD_LABELS[refPeriod] || refPeriod}</strong>
              </span>
            </div>
            <div className="font-mono text-xs text-slate-300 truncate max-w-2xl bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
              curl "https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Developer_Sales&refPeriod={refPeriod}" -H "AccessKey: {accessKey}" -H "Token: {token}"
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsConsoleOpen(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              Inspect Headers & JSON
            </button>
          </div>
        </div>

        {/* Executive KPI Statistics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Projects Tracked */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg backdrop-blur-sm">
            <div className="text-[11px] font-medium text-slate-400 uppercase">Active Developments</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {stats.totalProjects}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              In Reference Period {refPeriod}
            </div>
          </div>

          {/* Monthly Sales Volume */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg backdrop-blur-sm">
            <div className="text-[11px] font-medium text-slate-400 uppercase">Month Take-up Volume</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1">
              +{stats.monthlySales} <span className="text-xs text-slate-400 font-normal">units</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              New Options Issued (OTPs)
            </div>
          </div>

          {/* Cumulative Sold & Take-up Rate */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg backdrop-blur-sm">
            <div className="text-[11px] font-medium text-slate-400 uppercase">Total Sold / Launched</div>
            <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
              {stats.overallTakeUp}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {stats.totalSold.toLocaleString()} / {stats.totalLaunched.toLocaleString()} units
            </div>
          </div>

          {/* Average Transacted PSF */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg backdrop-blur-sm">
            <div className="text-[11px] font-medium text-slate-400 uppercase">Overall Median PSF</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              ${stats.avgPsf.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Singapore Private Market
            </div>
          </div>

          {/* Unsold Balance Stock */}
          <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg backdrop-blur-sm">
            <div className="text-[11px] font-medium text-slate-400 uppercase">Unsold Balance Inventory</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              {stats.totalUnsold.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Remaining Units for Sale
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects (e.g. Norwood Grand, Chuan Park, Havelock, CDL)..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start lg:self-auto">
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'table'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Table
              </button>
              <button
                onClick={() => setActiveTab('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Cards
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Market Trends
              </button>
              <button
                onClick={() => setActiveTab('developers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'developers'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Developers
              </button>
            </div>
          </div>

          {/* Segment Pills & Dropdown Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/70">
            {/* Market Segment Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Regions' },
                { id: 'CCR', label: 'Core Central (CCR)' },
                { id: 'RCR', label: 'City Fringe (RCR)' },
                { id: 'OCR', label: 'Outside Central (OCR)' },
                { id: 'EC', label: 'Executive Condos (EC)' },
              ].map((seg) => (
                <button
                  key={seg.id}
                  onClick={() => setSelectedSegment(seg.id)}
                  className={`text-xs px-3 py-1 rounded-lg transition font-medium ${
                    selectedSegment === seg.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {seg.label}
                </button>
              ))}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2">
              {/* District Filter */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="ALL">All Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Property Type Filter */}
              <select
                value={selectedPropertyType}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Types</option>
                <option value="Condominium">Condominium</option>
                <option value="Executive Condominium">Executive Condominium</option>
                <option value="Apartment">Apartment</option>
              </select>

              {(searchQuery || selectedSegment !== 'ALL' || selectedDistrict !== 'ALL' || selectedPropertyType !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSegment('ALL');
                    setSelectedDistrict('ALL');
                    setSelectedPropertyType('ALL');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline ml-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Export Notification Toast */}
        {exportNotice && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
            <span>{exportNotice}</span>
            <button onClick={() => setExportNotice(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Active Tab View Rendering */}
        {activeTab === 'table' && (
          <ProjectsTable
            projects={filteredProjects}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onSelectProject={setSelectedProject}
          />
        )}

        {activeTab === 'grid' && (
          <ProjectsGrid
            projects={filteredProjects}
            onSelectProject={setSelectedProject}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCharts
            projects={baseRecords}
            onSelectProject={setSelectedProject}
          />
        )}

        {activeTab === 'developers' && (
          <DeveloperLeaderboard
            projects={baseRecords}
            onSelectProject={setSelectedProject}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Data Source: Singapore Urban Redevelopment Authority (URA) Real Estate Information System (REALIS) &amp; DataService API (<code className="text-slate-400">PMI_Resi_Developer_Sales</code>).
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsConsoleOpen(true)}
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              API Console
            </button>
            <a
              href="https://www.ura.gov.sg/Corporate/Property/Property-Market-Information"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white flex items-center gap-1"
            >
              URA Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* API Console & cURL Inspector Modal */}
      <ApiConsoleModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        accessKey={accessKey}
        setAccessKey={setAccessKey}
        token={token}
        setToken={setToken}
        refPeriod={refPeriod}
        setRefPeriod={setRefPeriod}
        onDataLoaded={(records) => {
          setLiveRecords(records);
          setIsLiveApiData(true);
          setIsConsoleOpen(false);
        }}
      />

      {/* Project Detail Dossier Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
