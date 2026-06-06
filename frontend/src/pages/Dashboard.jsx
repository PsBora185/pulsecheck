import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function Dashboard() {
  const [status, setStatus] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [interval, setIntervalVal] = useState(10);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchStatus = async () => {
    try {
      const res = await client.get('/api/status');
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch monitors', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!newUrl) return;
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const res = await client.post('/api/monitor', { url: newUrl, interval });
      setMessage(res.data.message || 'Successfully deployed target!');
      setNewUrl('');
      setIntervalVal(10);
      setIsModalOpen(false);
      fetchStatus();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deploy URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent navigation to detail page
    if (!window.confirm("Are you sure you want to deactivate this monitor?")) return;

    try {
      await client.delete(`/api/monitor/${id}`);
      fetchStatus();
    } catch (err) {
      console.error("Failed to delete monitor", err);
      alert("Failed to delete monitor.");
    }
  };

  const onlineCount = status.filter(s => s.isUp).length;
  const offlineCount = status.filter(s => !s.isUp).length;

  const validLatencies = status.filter(s => s.isUp && s.latency != null).map(s => s.latency);
  const avgResponseTime = validLatencies.length > 0 
    ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length) 
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Surveillance Center</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time status check on target platforms</p>
        </div>
        <button
          onClick={() => { setError(''); setMessage(''); setIsModalOpen(true); }}
          className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm shadow-sm inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <span>➕</span> Deploy Target
        </button>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm rounded-lg p-3 mb-6 font-medium">
          ✅ {message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Monitored</h3>
          <p className="text-3xl font-black text-slate-800">{status.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow border-l-4 border-emerald-500">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 text-emerald-600">Online Services</h3>
          <p className="text-3xl font-black text-emerald-600">{onlineCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow border-l-4 border-rose-500">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 text-rose-500">Offline Services</h3>
          <p className="text-3xl font-black text-rose-500">{offlineCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow border-l-4 border-amber-500">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 text-amber-600">Avg Latency</h3>
          <p className="text-3xl font-black text-amber-600">{avgResponseTime} <span className="text-sm font-bold">ms</span></p>
        </div>
      </div>

      {/* Target Cards */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">Surveillance Grid</h2>
      {status.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-xl p-12 text-center text-slate-400 shadow-sm">
          <span className="text-3xl">📡</span>
          <p className="mt-2 text-sm">No services currently under surveillance. Click "Deploy Target" above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {status.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/monitor/${s.id}`)}
              className={`bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-500 hover:shadow-md cursor-pointer transition-all border-t-4 ${
                s.isUp ? 'border-t-emerald-500' : 'border-t-rose-500'
              }`}
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-800 text-lg truncate" title={s.url}>
                    {s.name || s.url.replace(/^https?:\/\//, '')}
                  </h3>
                  <p className="text-slate-400 text-xs truncate mt-0.5">{s.url}</p>
                </div>
                <span
                  className={`text-2xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    s.isUp
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}
                >
                  {s.isUp ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              <div className="flex justify-between items-end border-t border-slate-100 pt-4 mt-2">
                <div className="flex gap-6">
                  <div>
                    <p className="text-slate-400 text-2xs uppercase font-semibold">Latency</p>
                    <p className="text-slate-800 font-extrabold text-base mt-0.5">
                      {s.isUp && s.latency != null ? `${s.latency} ms` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-2xs uppercase font-semibold">Last Checked</p>
                    <p className="text-slate-700 font-medium text-xs mt-1">
                      {s.ts ? new Date(s.ts).toLocaleTimeString() : '—'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(e, s.id)}
                  className="text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600 px-2.5 py-1.5 rounded transition-colors border border-rose-100 font-semibold"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Monitor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center px-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-100 p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg focus:outline-none"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-slate-950 mb-1">Deploy New Monitor</h3>
            <p className="text-slate-500 text-xs mb-6">Specify target credentials for active pings</p>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 text-sm rounded-lg p-3 mb-4 font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleAddUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Target URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.stripe.com/health"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Ping Interval (seconds)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  value={interval}
                  onChange={(e) => setIntervalVal(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deploying...' : 'Deploy Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
