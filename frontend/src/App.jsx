import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [interval, setIntervalVal] = useState(10);
  const [message, setMessage] = useState('');

  const fetchStatus = () => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        // Sort to show offline items at top, then recently checked
        const sorted = data.sort((a,b) => (a.isUp === b.isUp) ? b.ts - a.ts : (a.isUp ? 1 : -1));
        setStatus(sorted);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!newUrl) return;
    
    try {
      const res = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl, interval })
      });
      const data = await res.json();
      setMessage(data.message || 'Successfully deployed target!');
      setNewUrl('');
      setIntervalVal(10);
      fetchStatus();
      
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Failed to deploy URL.');
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const onlineCount = status.filter(s => s.isUp).length;
  const offlineCount = status.filter(s => !s.isUp).length;

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>PULSE<span style={{color: '#fff', fontWeight: 'normal'}}>CHECK</span></h2>
        <ul className="sidebar-menu">
          <li>📊 Dashboard</li>
          <li>🎯 Targets</li>
          <li>⚙️ Settings</li>
          <li>🔔 Alerts</li>
        </ul>
      </div>
      
      <div className="main-content">
        <div className="header">
          <h1>System Overview</h1>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <h3>Total Monitored</h3>
            <div className="value">{status.length}</div>
          </div>
          <div className="stat-card up">
            <h3>Online Services</h3>
            <div className="value">{onlineCount}</div>
          </div>
          <div className="stat-card down">
            <h3>Offline Services</h3>
            <div className="value">{offlineCount}</div>
          </div>
        </div>

        <div className="form-container">
          <h3>Deploy New Monitor</h3>
          <form onSubmit={handleAddUrl} className="add-form">
            <input 
              type="url" 
              placeholder="e.g. https://api.stripe.com/health" 
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
            />
            <input 
              type="number" 
              placeholder="10" 
              value={interval}
              onChange={(e) => setIntervalVal(e.target.value)}
              min="1"
              required
              title="Ping Interval in Seconds"
            />
            <button type="submit">Deploy Target</button>
          </form>
          {message && <p style={{ color: '#20bf6b', marginTop: '15px', fontSize: '15px', fontWeight: '600' }}>{message}</p>}
        </div>

        <div className="targets-grid">
          {status.length === 0 ? (
            <p style={{ color: '#7f8fa6', gridColumn: 'span 3', fontSize: '16px' }}>
              No services currently under surveillance. Deploy a target above to begin.
            </p>
          ) : (
             status.map((s, idx) => (
              <div key={idx} className={`target-card ${s.isUp ? 'online' : 'offline'}`}>
                <div className="target-header">
                  <div className="target-url">{s.url.replace(/^https?:\/\//, '')}</div>
                  <div className={`status-badge ${s.isUp ? 'online' : 'offline'}`}>
                    {s.isUp ? 'ONLINE' : 'OFFLINE'}
                  </div>
                </div>
                <div className="target-metrics">
                  <div className="metric">
                    Latency
                    <span>{s.latency} ms</span>
                  </div>
                  <div className="metric" style={{textAlign: 'right'}}>
                    Last Ping
                    <span>{new Date(s.ts).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
