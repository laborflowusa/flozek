import React, { useState } from 'react';

export default function WalterAI() {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const analyzeWater = async () => {
    if (!zipCode || zipCode.length !== 5) {
      setResponse({ error: 'Please enter a valid 5-digit ZIP code' });
      return;
    }

    setLoading(true);
    setResponse(null);

    // Simulate AI response (replace with your actual API call later)
    setTimeout(() => {
      setResponse({
        message: `Water quality analysis for ZIP code ${zipCode}`,
        score: Math.floor(Math.random() * 100),
        contaminants: {
          lead: 'Low',
          chlorine: 'Moderate',
          pfos: 'Not detected'
        },
        recommendation: 'Your water is generally safe. Consider a carbon filter for taste.'
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{
      background: '#0a0e1a',
      borderRadius: '20px',
      padding: '2rem',
      marginTop: '1rem'
    }}>
      <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>🤖</span> Ask WALTER
      </h2>
      <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
        Water Analysis & Life Track Enhancement Recommendations
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Enter ZIP code (e.g., 90210)"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          maxLength={5}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid #2a2e3a',
            background: '#1a1e2a',
            color: 'white',
            fontSize: '1rem'
          }}
        />
        <button
          onClick={analyzeWater}
          disabled={loading}
          style={{
            background: '#0a84ff',
            color: 'white',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '12px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Analyzing...' : 'Ask WALTER'}
        </button>
      </div>

      {response && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          background: '#0e121e',
          borderRadius: '12px',
          borderLeft: response.error ? '4px solid #ff4444' : '4px solid #0a84ff'
        }}>
          {response.error ? (
            <div style={{ color: '#ff8888' }}>⚠️ {response.error}</div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <span>🤖</span>
                <strong style={{ color: '#0a84ff' }}>WALTER says:</strong>
              </div>
              <p>{response.message}</p>
              <div style={{ marginTop: '1rem' }}>
                <strong>Water Quality Score:</strong> {response.score}/100
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Contaminants:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>Lead: {response.contaminants?.lead}</li>
                  <li>Chlorine: {response.contaminants?.chlorine}</li>
                  <li>PFOS: {response.contaminants?.pfos}</li>
                </ul>
              </div>
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#1a1e2a', borderRadius: '8px' }}>
                <strong>💡 Recommendation:</strong> {response.recommendation}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
