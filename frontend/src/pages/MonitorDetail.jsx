import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function MonitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [range, setRange] = useState('24h');
  const [history, setHistory] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [monitor, setMonitor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const historyRes = await client.get(`/api/monitor/${id}/history?range=${range}`);
      setHistory(historyRes.data);

      const incidentsRes = await client.get(`/api/monitor/${id}/incidents`);
      setIncidents(incidentsRes.data);

      const statusRes = await client.get('/api/status');
      const details = statusRes.data.find(m => m.id === Number(id));
      setMonitor(details);
    } catch (err) {
      console.error('Failed to fetch monitor details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, range]);

  const totalChecks = history.length;
  const upChecks = history.filter(h => h.status === 'UP').length;
  const uptimePercentage = totalChecks > 0 ? ((upChecks / totalChecks) * 100).toFixed(2) : '100.00';

  const chartData = history.map(item => ({
    time: new Date(item.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    latency: item.responseTimeMs,
    status: item.status
  }));

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading && !monitor) {
    return (
      <div className="p-8 text-center text-slate-500 font-sans">
        <span className="text-xl animate-spin inline-block">⏳</span> Loading monitor metrics...
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="p-8 text-center text-slate-500 font-sans">
        <p className="text-rose-500 font-bold mb-4">Monitor not found.</p>
        <button onClick={() => navigate('/')} className="text-sky-500 underline font-semibold">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans animate-fade-in">
      <button
        onClick={() => navigate('/')}
        className="text-slate-500 hover:text-slate-700 font-medium inline-flex items-center gap-2 mb-6 transition-colors text-sm"
      >
        <span>⬅️</span> Back to Dashboard
      </button>

      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950 truncate max-w-lg">{monitor.name || monitor.url.replace(/^https?:\/\//, '')}</h1>
            <p className="text-slate-400 text-sm mt-1 select-all">{monitor.url}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-slate-100 px-3 py-1.5 rounded-full bg-slate-50/50 shadow-xs shrink-0">
              <span className="relative flex h-2.5 w-2.5 animate-pulse">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  monitor.isUp ? 'bg-emerald-400' : 'bg-rose-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  monitor.isUp ? 'bg-emerald-500' : 'bg-rose-500'
                }`}></span>
              </span>
              <span className={`text-2xs font-extrabold tracking-wider ${
                monitor.isUp ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {monitor.isUp ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xs text-slate-400 font-bold uppercase tracking-wider">Uptime ({range})</p>
              <p className="text-lg font-black text-slate-800">{uptimePercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">Latency History (ms)</h2>
          <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-xs font-semibold">
            {['24h', '7d', '30d'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-md transition-all ${
                  range === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No ping history recorded in this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                  name="Latency"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Incident Log (Outages)</h2>
        {incidents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm border border-slate-100 rounded-lg bg-slate-50/50">
            ✅ No outages detected. Zero incidents recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-2xs">
                  <th className="pb-3">Incident Time</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Reason / Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((inc, idx) => (
                  <tr key={idx} className="text-slate-700">
                    <td className="py-3.5 font-medium">{new Date(inc.startedAt).toLocaleString()}</td>
                    <td className="py-3.5 text-rose-600 font-semibold">{formatDuration(inc.duration)}</td>
                    <td className="py-3.5">
                      <span className="bg-rose-50 border border-rose-100 text-rose-600 text-xs px-2.5 py-0.5 rounded font-mono font-semibold">
                        {inc.reason}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
