import React, { useState } from 'react';
import './App.css';
import TeamBuilder from './components/TeamBuilder';

function App() {
  const [error, setError] = useState('');

  return (
    <div className="App">
      <header className="App-header">
        <h1>BALLIN' ON A BUDGET | BUDGET GM</h1>
      </header>
      <main>
        {error && <div className="global-error">{error}</div>}
        <TeamBuilder onError={setError} />
      </main>
    </div>
  );
}

export default App;
