import React, { useState } from 'react';
import Disclaimer from './components/Disclaimer';
import CheckoutButton from './components/CheckoutButton';
import WalterAI from './components/WalterAI';

function App() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  if (!agreedToTerms) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#06080f',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '5rem' }}>💧</div>
          <h1 style={{ fontSize: '3rem', margin: '0.5rem 0' }}>Flo·zēk</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem' }}>
            Water Intelligence Platform
          </p>
          
          <Disclaimer />
          
          <button
            onClick={() => setAgreedToTerms(true)}
            style={{
              background: '#0a84ff',
              color: 'white',
              border: 'none',
              padding: '14px 36px',
              fontSize: '1.1rem',
              borderRadius: '30px',
              cursor: 'pointer',
              marginTop: '2rem'
            }}
          >
            Enter Flo·zēk
          </button>
          <p style={{ fontSize: '0.75rem', marginTop: '2rem', opacity: 0.5 }}>
            © 2026 Flo·zēk · Seek what flows through you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06080f',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '2rem' }}>💧</span>
            <span style={{ fontSize: '1.5rem', marginLeft: '0.5rem' }}>Flo·zēk</span>
          </div>
          <CheckoutButton />
        </div>
        
        <WalterAI />
      </div>
    </div>
  );
}

export default App;
