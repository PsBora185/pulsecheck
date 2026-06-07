import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function Dashboard() {
  const [status, setStatus] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [interval, setIntervalVal] = useState(10);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [editName, setEditName] = useState('');
  const [editInterval, setEditInterval] = useState(10);

  // Custom Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
      const res = await client.post('/api/monitor', { url: newUrl, name: newName, interval });
      setMessage(res.data.message || 'Successfully deployed target!');
      setNewUrl('');
      setNewName('');
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

  const handleOpenEdit = (e, s) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditUrl(s.url);
    setEditName(s.name);
    setEditInterval(s.interval || 10);
    setError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editUrl) return;
    setError('');
    setLoading(true);

    try {
      await client.put(`/api/monitor/${editingId}`, {
        url: editUrl,
        name: editName,
        interval: editInterval
      });
      setIsEditModalOpen(false);
      fetchStatus();
      setMessage('Monitor details updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update monitor.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (e, id) => {
    e.stopPropagation();
    try {
      await client.patch(`/api/monitor/${id}/toggle`);
      fetchStatus();
    } catch (err) {
      console.error("Failed to toggle monitor status", err);
    }
  };

  const handleOpenDeleteConfirm = (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setError('');
    setLoading(true);
    try {
      await client.delete(`/api/monitor/${deletingId}`);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      fetchStatus();
      setMessage('Monitor and all history deleted successfully.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error("Failed to delete monitor", err);
      alert("Failed to delete monitor.");
    } finally {
      setLoading(false);
    }
  };

  const onlineCount = status.filter(s => s.isActive && s.isUp).length;
  const offlineCount = status.filter(s => s.isActive && !s.isUp).length;

  const validLatencies = status.filter(s => s.isActive && s.isUp && s.latency != null).map(s => s.latency);
  const avgResponseTime = validLatencies.length > 0 
    ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length) 
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Surveillance Center</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time status check on target platforms</p>
        </div>
        <button
          onClick={() => { setError(''); setMessage(''); setIsModalOpen(true); }}
          className="bg-sky-600 hover:bg-sky-500 hover:scale-[1.02] active:scale-[0.98] text-white font-semibold py-2.5 px-5 rounded-lg transition-all text-sm shadow-sm inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <span>➕</span> Deploy Target
        </button>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm rounded-lg p-3 mb-6 font-medium animate-slide-up">
          ✅ {message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Monitored</h3>
          <p className="text-3xl font-black text-slate-800">{status.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 border-l-4 border-emerald-500">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 text-emerald-600">Online Services</h3>
          <p className="text-3xl font-black text-emerald-600">{onlineCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 border-l-4 border-rose-500">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 text-rose-500">Offline Services</h3>
          <p className="text-3xl font-black text-rose-500">{offlineCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 border-l-4 border-amber-500">
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
              className={`bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-500 hover:shadow-md cursor-pointer transition-all duration-300 border-t-4 hover:scale-[1.01] ${
                !s.isActive 
                  ? 'border-t-slate-400 opacity-70 bg-slate-50/50' 
                  : s.isUp 
                    ? 'border-t-emerald-500' 
                    : 'border-t-rose-500'
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
                    !s.isActive
                      ? 'bg-slate-100 text-slate-500 border border-slate-200'
                      : s.isUp
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}
                >
                  {!s.isActive ? 'PAUSED' : s.isUp ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              <div className="flex justify-between items-end border-t border-slate-100 pt-4 mt-2">
                <div className="flex gap-4 sm:gap-6">
                  <div>
                    <p className="text-slate-400 text-2xs uppercase font-semibold">Latency</p>
                    <p className="text-slate-800 font-extrabold text-base mt-0.5">
                      {s.isActive && s.isUp && s.latency != null ? `${s.latency} ms` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-2xs uppercase font-semibold">Interval</p>
                    <p className="text-slate-700 font-semibold text-xs mt-1">
                      {s.interval}s
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-2xs uppercase font-semibold">Last Checked</p>
                    <p className="text-slate-700 font-medium text-xs mt-1">
                      {s.isActive && s.ts ? new Date(s.ts).toLocaleTimeString() : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => handleOpenEdit(e, s)}
                    className="text-xs text-sky-600 hover:bg-sky-50 hover:text-sky-700 px-2.5 py-1.5 rounded transition-all border border-sky-100 font-semibold active:scale-[0.95]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleToggleActive(e, s.id)}
                    className={`text-xs px-2.5 py-1.5 rounded transition-all border font-semibold active:scale-[0.95] ${
                      s.isActive
                        ? 'text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-600'
                        : 'text-emerald-600 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {s.isActive ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={(e) => handleOpenDeleteConfirm(e, s.id)}
                    className="text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600 px-2.5 py-1.5 rounded transition-all border border-rose-100 font-semibold active:scale-[0.95]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Monitor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center px-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-100 p-6 relative animate-scale-up">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg focus:outline-none"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-slate-950 mb-1">Deploy New Monitor</h3>
            <p className="text-slate-500 text-xs mb-6">Specify target configurations for active pings</p>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 text-sm rounded-lg p-3 mb-4 font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleAddUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Friendly Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stripe API Gateway"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

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

      {/* Edit Monitor Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center px-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-100 p-6 relative animate-scale-up">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg focus:outline-none"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-slate-950 mb-1">Edit Monitor</h3>
            <p className="text-slate-500 text-xs mb-6">Modify target surveillance configurations</p>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 text-sm rounded-lg p-3 mb-4 font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Friendly Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Domain"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Target URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.stripe.com/health"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
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
                  value={editInterval}
                  onChange={(e) => setEditInterval(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center px-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-100 p-6 relative animate-scale-up">
            <h3 className="text-xl font-bold text-slate-950 mb-2">Delete Monitor</h3>
            <p className="text-slate-500 text-sm mb-6">
              Are you absolutely sure you want to completely delete this monitor? All historical ping logs and statistics will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDeletingId(null); }}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 animate-pulse"
              >
                {loading ? 'Deleting...' : 'Delete Completely'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
