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
    const [isSimulated, setIsSimulated] = useState(false);

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

    // Update player options whenever selected players change
    useEffect(() => {
        if (Object.keys(playerPool).length > 0) {
            updatePlayerOptions(playerPool);
        }
    }, [selectedPlayers, playerPool]); // eslint-disable-line react-hooks/exhaustive-deps

    const updatePlayerOptions = (pool) => {
        // Create a list of all selected player names for quick lookup
        const selectedPlayerNames = selectedPlayers.map(p => p.name);
        console.log('Selected player names:', selectedPlayerNames);
        
        const options = [];
        
        // Process each cost category
        ['$3', '$2', '$1', '$0'].forEach(category => {
            if (pool[category]) {
                // Filter out players that are already selected
                const availablePlayers = pool[category].filter(player => 
                    !selectedPlayerNames.includes(player.name)
                );
                
                console.log(`Category ${category}: ${availablePlayers.length} available players`);
                
                // Add available players to options with their cost
                availablePlayers.forEach(player => {
                    options.push({
                        ...player,
                        cost: parseInt(category.replace('$', ''))
                    });
                });
            }
        });
        
        console.log('Final player options:', options);
        setPlayerOptions(options);
    };

    const selectPlayer = (player) => {
        // Check if player is already selected
        if (selectedPlayers.some(p => p.name === player.name)) {
            setError('Player already selected');
            return;
        }
        
        if (selectedPlayers.length >= 5) {
            setError('Team is already full');
            return;
        }
        if (budget < player.cost) {
            setError('Not enough budget');
            return;
        }

        // Add player to selected players
        const newSelectedPlayers = [...selectedPlayers, player];
        setSelectedPlayers(newSelectedPlayers);
        
        // Update budget
        setBudget(budget - player.cost);
        
        setError('');
    };

    const removePlayer = (playerName) => {
        const player = selectedPlayers.find(p => p.name === playerName);
        if (player) {
            // Remove player from selected players
            const newSelectedPlayers = selectedPlayers.filter(p => p.name !== playerName);
            setSelectedPlayers(newSelectedPlayers);
            
            // Update budget
            setBudget(budget + player.cost);
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
            
            // Generate hypothetical player stats based on cost
            const playerStats = {};
            selectedPlayers.forEach(player => {
                // Base stats vary by cost tier
                let baseStats = {
                    ppg: 0,
                    rpg: 0,
                    apg: 0,
                    spg: 0,
                    bpg: 0
                };
                
                // Set base stats based on cost tier
                if (player.cost === 3) {
                    baseStats = { ppg: 25, rpg: 7, apg: 5, spg: 1.5, bpg: 0.5 };
                } else if (player.cost === 2) {
                    baseStats = { ppg: 18, rpg: 5, apg: 4, spg: 1, bpg: 0.3 };
                } else if (player.cost === 1) {
                    baseStats = { ppg: 12, rpg: 4, apg: 3, spg: 0.8, bpg: 0.2 };
                } else {
                    baseStats = { ppg: 8, rpg: 3, apg: 2, spg: 0.5, bpg: 0.1 };
                }
                
                // Add some randomness (±10%)
                playerStats[player.name] = {
                    ppg: baseStats.ppg * (0.9 + Math.random() * 0.2),
                    rpg: baseStats.rpg * (0.9 + Math.random() * 0.2),
                    apg: baseStats.apg * (0.9 + Math.random() * 0.2),
                    spg: baseStats.spg * (0.9 + Math.random() * 0.2),
                    bpg: baseStats.bpg * (0.9 + Math.random() * 0.2)
                };
            });
            
            // Add player stats to the response
            const recordWithStats = {
                ...response.data,
                player_stats: playerStats
            };
            
            setRecord(recordWithStats);
            setIsSimulated(true);
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
                            {!isSimulated && (
                                <button onClick={() => removePlayer(player.name)}>Remove</button>
                            )}
                        </div>
                    ))}
                </div>
                {record && (
                    <div className="record-display">
                        <h3>Projected Record: {record.record}</h3>
                        <div className="player-stats">
                            {selectedPlayers.map(player => (
                                <div key={player.name} className="player-stat">
                                    <h4>{player.name}</h4>
                                    <p>PPG: {record.player_stats[player.name].ppg.toFixed(1)}</p>
                                    <p>RPG: {record.player_stats[player.name].rpg.toFixed(1)}</p>
                                    <p>APG: {record.player_stats[player.name].apg.toFixed(1)}</p>
                                    <p>SPG: {record.player_stats[player.name].spg.toFixed(1)}</p>
                                    <p>BPG: {record.player_stats[player.name].bpg.toFixed(1)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {!isSimulated && (
                <>
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
                </>
            )}
        </div>
    );
};

export default TeamBuilder; 