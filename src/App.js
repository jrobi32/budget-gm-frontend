import React, { useState, useEffect } from 'react';
import './App.css';
import TeamBuilder from './components/TeamBuilder';

function App() {
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    // Only allow alphanumeric characters and spaces
    if (/^[a-zA-Z0-9\s]*$/.test(value)) {
      setNickname(value);
    }
  };

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
              onChange={handleNicknameChange}
              className="nickname-field"
              maxLength={20}
            />
          </div>
        </div>
      </header>
      <main>
        {error && <div className="global-error">{error}</div>}
        <TeamBuilder onError={setError} nickname={nickname.trim()} />
      </main>
    </div>
  );
}

export default App;
