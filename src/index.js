import React from 'react';
import ReactDOM from 'react-dom/client';
import Disclaimer from './Disclaimer';
import App from './App';

function Root() {
  const [accepted, setAccepted] = React.useState(false);
  if (!accepted) return <Disclaimer onAccept={() => setAccepted(true)} />;
  return <App />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
