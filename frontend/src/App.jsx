import { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState([]);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>PulseCheck Monitor</h1>
      <h2>Current Service Status</h2>
      <ul>
        {status.length === 0 && <li>Loading or no services monitored yet...</li>}
        {status.map((s, idx) => (
          <li key={idx} style={{ color: s.isUp ? 'green' : 'red' }}>
            {s.url} - {s.isUp ? 'UP' : 'DOWN'} (Latency: {s.latency}ms)
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
