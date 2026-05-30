import { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [message, setMessage] = useState('');

  const fetchStatus = () => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!newUrl) return;
    
    try {
      const res = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl })
      });
      const data = await res.json();
      setMessage(data.message || 'Added successfully!');
      setNewUrl('');
      fetchStatus();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to add URL.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#333' }}>PULSE<span style={{color: '#0066cc'}}>CHECK</span></h1>
        <p style={{ margin: '5px 0 0 0', color: '#666' }}>Uptime Monitoring Dashboard</p>
      </header>

      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Monitor New Service</h3>
        <form onSubmit={handleAddUrl} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="url" 
            placeholder="https://example.com" 
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <button type="submit" style={{ padding: '10px 20px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Add Target
          </button>
        </form>
        {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
      </div>

      <div>
        <h2>Active Services</h2>
        {status.length === 0 ? (
          <p style={{ color: '#888' }}>No services monitored yet. Add one above!</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {status.map((s, idx) => (
              <div key={idx} style={{ 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                borderLeft: s.isUp ? '5px solid #28a745' : '5px solid #dc3545',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'white'
              }}>
                <div>
                  <strong style={{ fontSize: '1.1em' }}>{s.url}</strong>
                  <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                    Latency: {s.latency}ms | Last Check: {new Date(s.ts).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ 
                  background: s.isUp ? '#d4edda' : '#f8d7da', 
                  color: s.isUp ? '#155724' : '#721c24',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontWeight: 'bold'
                }}>
                  {s.isUp ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
