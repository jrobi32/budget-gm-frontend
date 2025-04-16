import React, { useState } from 'react';
import './App.css';
import TeamBuilder from './components/TeamBuilder';

function App() {
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>BALLIN' ON A BUDGET | BUDGET GM</h1>
          <div className="nickname-input">
            <input
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="nickname-field"
            />
          </div>
        </div>
      </header>
      <main>
        {error && <div className="global-error">{error}</div>}
        <TeamBuilder onError={setError} nickname={nickname} />
      </main>
    </div>
  );
}

export default App;
