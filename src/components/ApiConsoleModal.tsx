import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Key, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  X,
  Code2,
  Lock,
  Layers
} from 'lucide-react';
import { DeveloperSaleRecord, UraApiResponse } from '../data/developerSalesData';

interface ApiConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessKey: string;
  setAccessKey: (key: string) => void;
  token: string;
  setToken: (token: string) => void;
  refPeriod: string;
  setRefPeriod: (period: string) => void;
  onDataLoaded: (records: DeveloperSaleRecord[], isLive: boolean) => void;
}

export const ApiConsoleModal: React.FC<ApiConsoleModalProps> = ({
  isOpen,
  onClose,
  accessKey,
  setAccessKey,
  token,
  setToken,
  refPeriod,
  setRefPeriod,
  onDataLoaded,
}) => {
  const [service, setService] = useState('PMI_Resi_Developer_Sales');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [apiResponse, setApiResponse] = useState<UraApiResponse | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestLatency, setRequestLatency] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentCurlCommand = `curl "https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=${service}&refPeriod=${refPeriod}" \\
  -H "AccessKey: ${accessKey || '<YOUR_ACCESS_KEY>'}" \\
  -H "Token: ${token || '<YOUR_DAILY_TOKEN>'}"`;

  const copyToClipboard = (text: string, isCurl: boolean) => {
    navigator.clipboard.writeText(text);
    if (isCurl) {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setApiResponse(null);
    setHttpStatus(null);
    const startTime = performance.now();

    try {
      // Execute through proxy
      const response = await fetch(
        `/api/ura/invoke?service=${encodeURIComponent(service)}&refPeriod=${encodeURIComponent(refPeriod)}`,
        {
          headers: {
            AccessKey: accessKey,
            Token: token,
          },
        }
      );

      const latency = Math.round(performance.now() - startTime);
      setRequestLatency(latency);
      setHttpStatus(response.status);

      const data = await response.json();
      setApiResponse(data);

      if (data.Status === 'Success' && Array.isArray(data.Result) && data.Result.length > 0) {
        onDataLoaded(data.Result, true);
      } else if (data.Status === 'Error') {
        setErrorMessage(data.Message || 'URA API returned an error: ' + (data.Message || 'Invalid input or credentials.'));
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime);
      setRequestLatency(latency);
      setErrorMessage(err.message || 'Failed to connect to URA API service');
      setApiResponse({
        Status: 'Error',
        Message: err.message || 'Network error or unable to reach proxy',
        Result: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                URA DataService cURL Terminal
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  v1 API
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official Urban Redevelopment Authority (URA) Singapore Property Market Information Endpoint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Curl Command Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                Live Generated cURL Command:
              </label>
              <button
                onClick={() => copyToClipboard(currentCurlCommand, true)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 transition"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCurl ? 'Copied to Clipboard!' : 'Copy cURL'}
              </button>
            </div>
            <div className="relative font-mono text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 leading-relaxed overflow-x-auto shadow-inner">
              <pre>{currentCurlCommand}</pre>
            </div>
          </div>

          {/* Parameters Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Service Parameter (<code className="text-indigo-400 font-mono">service</code>)
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="PMI_Resi_Developer_Sales">PMI_Resi_Developer_Sales (Developer Monthly Sales)</option>
                <option value="PMI_Resi_Transaction">PMI_Resi_Transaction (Caveats Lodged)</option>
                <option value="PMI_Resi_Rental_Median">PMI_Resi_Rental_Median (Median Rentals)</option>
                <option value="PMI_Resi_Pipeline">PMI_Resi_Pipeline (Supply in Pipeline)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Reference Period (<code className="text-indigo-400 font-mono">refPeriod</code> MMYY)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={refPeriod}
                  onChange={(e) => setRefPeriod(e.target.value)}
                  placeholder="e.g. 0826"
                  maxLength={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setRefPeriod('0826')}
                  className={`text-xs px-2.5 py-1.5 rounded border transition font-mono ${
                    refPeriod === '0826'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  0826
                </button>
                <button
                  type="button"
                  onClick={() => setRefPeriod('0926')}
                  className={`text-xs px-2.5 py-1.5 rounded border transition font-mono ${
                    refPeriod === '0926'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  0926
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Header: AccessKey
                </label>
                <span className="text-[10px] text-slate-400">Granted via URA Account</span>
              </div>
              <input
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="e.g. 064377bb-781f-488b-a320-xxxx"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  Header: Token
                </label>
                <span className="text-[10px] text-slate-400">Daily valid session token</span>
              </div>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. 70ab-3d2f-11ef-xxxx"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Proxy Route: <code className="text-slate-300">/api/ura/invoke</code> (CORS enabled)
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExecute}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing Request...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Execute Live API Call
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response Inspector */}
          {apiResponse && (
            <div className="space-y-2 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    API Response
                  </span>
                  {httpStatus && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-mono font-medium ${
                        httpStatus === 200
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      HTTP {httpStatus}
                    </span>
                  )}
                  {requestLatency !== null && (
                    <span className="text-xs text-slate-400 font-mono">
                      {requestLatency}ms
                    </span>
                  )}
                </div>

                <button
                  onClick={() => copyToClipboard(JSON.stringify(apiResponse, null, 2), false)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedJson ? 'JSON Copied' : 'Copy JSON'}
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <div className="font-semibold mb-0.5">Note on URA API Authentication:</div>
                    <p className="text-amber-200/90 leading-relaxed">
                      {errorMessage}
                    </p>
                    <p className="mt-1 text-slate-400">
                      When using dummy or expired credentials, the live URA server returns <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">Invalid input</code>. The dashboard automatically supplies the verified August 2026 dataset so you can analyze all projects.
                    </p>
                  </div>
                </div>
              )}

              <div className="relative font-mono text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 max-h-56 overflow-y-auto">
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Guide to obtaining URA keys */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              How to get an official Singapore URA AccessKey & Daily Token
            </h4>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                Visit the <a href="https://www.ura.gov.sg/uraDataService" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-1">Singapore URA Data Service portal <ExternalLink className="w-3 h-3" /></a> and register for a free Developer Account.
              </li>
              <li>
                You will receive an official <strong className="text-slate-300">AccessKey</strong> via email.
              </li>
              <li>
                Each day, generate a fresh <strong className="text-slate-300">Token</strong> by calling the endpoint:
                <code className="block mt-1 p-1.5 bg-slate-900 rounded text-slate-300 font-mono text-[11px] overflow-x-auto">
                  GET https://eservice.ura.gov.sg/uraDataService/insertNewToken.action -H "AccessKey: &lt;YOUR_KEY&gt;"
                </code>
              </li>
              <li>
                Pass both <code className="text-slate-300">AccessKey</code> and <code className="text-slate-300">Token</code> as headers to query <code className="text-slate-300">PMI_Resi_Developer_Sales</code> with reference period (e.g. <code className="text-slate-300">0826</code>).
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs text-slate-400">
            Selected Period: <span className="font-mono text-indigo-300 font-medium">{refPeriod}</span> (August 2026)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
