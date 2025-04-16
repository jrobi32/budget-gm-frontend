import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeamBuilder.css';

// Get API URL from environment variable or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TeamBuilder = () => {
    const [playerPool, setPlayerPool] = useState({});
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [playerOptions, setPlayerOptions] = useState([]);
    const [budget, setBudget] = useState(10);
    const [record, setRecord] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');

    const loadPlayerPool = async () => {
        try {
            console.log(`Fetching player pool from ${API_URL}/api/player_pool`);
            const response = await axios.get(`${API_URL}/api/player_pool`);
            console.log('Player pool response:', response.data);
            setPlayerPool(response.data);
            updatePlayerOptions(response.data);
        } catch (error) {
            console.error('Error loading player pool:', error);
            setError(`Error loading player pool: ${error.message}`);
        }
    };

    useEffect(() => {
        loadPlayerPool();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const updatePlayerOptions = (pool) => {
        const options = [];
        ['$3', '$2', '$1', '$0'].forEach(category => {
            if (pool[category]) {
                const players = pool[category].filter(player => 
                    !selectedPlayers.some(p => p.name === player.name)
                );
                if (players.length > 0) {
                    options.push(...players.map(player => ({
                        ...player,
                        cost: parseInt(category.replace('$', ''))
                    })));
                }
            }
        });
        setPlayerOptions(options);
    };

    const selectPlayer = (player) => {
        if (selectedPlayers.length >= 5) {
            setError('Team is already full');
            return;
        }
        if (budget < player.cost) {
            setError('Not enough budget');
            return;
        }

        const newSelectedPlayers = [...selectedPlayers, player];
        setSelectedPlayers(newSelectedPlayers);
        setBudget(budget - player.cost);
        updatePlayerOptions(playerPool);
        setError('');
    };

    const removePlayer = (playerName) => {
        const player = selectedPlayers.find(p => p.name === playerName);
        if (player) {
            setSelectedPlayers(selectedPlayers.filter(p => p.name !== playerName));
            setBudget(budget + player.cost);
            updatePlayerOptions(playerPool);
        }
    };

    const simulateTeam = async () => {
        if (selectedPlayers.length !== 5) {
            setError('Team must have exactly 5 players');
            return;
        }

        try {
            console.log(`Simulating team with players: ${selectedPlayers.map(p => p.name).join(', ')}`);
            const response = await axios.post(`${API_URL}/api/simulate`, {
                players: selectedPlayers.map(p => p.name),
                playerName: playerName
            });
            console.log('Simulation response:', response.data);
            setRecord(response.data);
            setError('');
        } catch (error) {
            console.error('Error simulating team:', error);
            setError(`Error simulating team: ${error.message}`);
        }
    };

    return (
        <div className="team-builder">
            <div className="team-section">
                <h2>Your Team</h2>
                <div className="budget-display">
                    Remaining Budget: ${budget}
                </div>
                <div className="selected-players">
                    {selectedPlayers.map(player => (
                        <div key={player.name} className="player-card">
                            <h3>{player.name}</h3>
                            <p>Cost: ${player.cost}</p>
                            <button onClick={() => removePlayer(player.name)}>Remove</button>
                        </div>
                    ))}
                </div>
                {record && (
                    <div className="record-display">
                        <h3>Projected Record: {record.record}</h3>
                        <p>Win Probability: {(record.win_probability * 100).toFixed(1)}%</p>
                    </div>
                )}
            </div>

            <div className="player-section">
                <h2>Available Players</h2>
                <div className="player-options">
                    {playerOptions.map(player => (
                        <div key={player.name} className="player-card">
                            <h3>{player.name}</h3>
                            <p>Cost: ${player.cost}</p>
                            <button 
                                onClick={() => selectPlayer(player)}
                                disabled={budget < player.cost || selectedPlayers.length >= 5}
                            >
                                Select
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="simulation-section">
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="player-name-input"
                />
                <button 
                    onClick={simulateTeam}
                    disabled={selectedPlayers.length !== 5 || !playerName}
                    className="simulate-button"
                >
                    Simulate Team
                </button>
            </div>
        </div>
    );
};

export default TeamBuilder; 