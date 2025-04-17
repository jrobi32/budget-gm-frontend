import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeamBuilder.css';
import { playerIds } from '../playerIds';

// Get API URL from environment variable or use default
const API_URL = process.env.REACT_APP_API_URL || 'https://budget-gm-backend.onrender.com';

// Function to get player image URL
const getPlayerImageUrl = (playerName) => {
    // For fictional players, use specific images from various sources
    const fictionalImages = {
        'Joe Rogan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Joe_Rogan_2019_cropped.jpg/440px-Joe_Rogan_2019_cropped.jpg',
        'Elon Musk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/440px-Elon_Musk_Royal_Society_%28crop2%29.jpg',
        'Mark Zuckerberg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/440px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg',
        'Logan Paul': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Logan_Paul_in_2019_by_Glenn_Francis.jpg/440px-Logan_Paul_in_2019_by_Glenn_Francis.jpg',
        'Super Mario': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/50/Mario_%28Nintendo_character%29.jpg/440px-Mario_%28Nintendo_character%29.jpg',
        'Dwayne "The Rock" Johnson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Dwayne_Johnson_2%2C_2013.jpg/440px-Dwayne_Johnson_2%2C_2013.jpg',
        'Air Bud': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Air_Bud_poster.jpg/440px-Air_Bud_poster.jpg'
    };
    
    // Check if it's a fictional player with a specific image
    if (fictionalImages[playerName]) {
        return fictionalImages[playerName];
    }
    
    // For NBA players, use their official NBA.com image
    // First try to get the player ID from the playerIds mapping
    const playerId = playerIds[playerName];
    if (playerId) {
        return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;
    }
    
    // If no player ID is found, try to get it from the player pool
    const playerPool = window.playerPool || {};
    for (const category in playerPool) {
        const player = playerPool[category]?.find(p => p.name === playerName);
        if (player?.id) {
            return `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png`;
        }
    }
    
    // Fallback for any other players - use a more professional looking placeholder
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&background=1E88E5&color=fff&size=200&bold=true&format=svg`;
};

const TeamBuilder = ({ onError, nickname }) => {
    const [playerPool, setPlayerPool] = useState({});
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [playerOptions, setPlayerOptions] = useState({});
    const [budget, setBudget] = useState(10);
    const [record, setRecord] = useState(null);
    const [error, setError] = useState('');
    const [isSimulated, setIsSimulated] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                setIsLoading(true);
                await loadPlayerPool();
            } catch (error) {
                console.error('Error initializing app:', error);
                setError('Failed to load application data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        initializeApp();
    }, []);

    const loadPlayerPool = async () => {
        try {
            // Log the full environment for debugging
            console.log('Environment:', {
                NODE_ENV: process.env.NODE_ENV,
                API_URL: process.env.REACT_APP_API_URL,
                REACT_APP_API_URL: process.env.REACT_APP_API_URL
            });

            // Create axios instance with default config
            const api = axios.create({
                baseURL: API_URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                withCredentials: false
            });

            console.log('Making request to:', `${API_URL}/api/player_pool`);
            const response = await api.get('/api/player_pool', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log('Player pool response:', response.data);
            
            if (!response.data || Object.keys(response.data).length === 0) {
                throw new Error('Empty player pool received');
            }
            
            // Validate the response structure
            const requiredCategories = ['$3', '$2', '$1', '$0'];
            for (const category of requiredCategories) {
                if (!response.data[category] || !Array.isArray(response.data[category])) {
                    throw new Error(`Invalid player pool structure: missing or invalid ${category} category`);
                }
            }
            
            setPlayerPool(response.data);
            updatePlayerOptions(response.data, []);  // Pass empty selected players initially
            setError('');
        } catch (error) {
            console.error('Error loading player pool:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                request: error.request,
                config: error.config,
                stack: error.stack
            });
            const errorMessage = error.response?.data?.error || error.message;
            setError(`Error loading player pool: ${errorMessage}`);
            setPlayerOptions({
                '$3': [],
                '$2': [],
                '$1': [],
                '$0': []
            });
            throw error; // Re-throw to be caught by initializeApp
        }
    };

    const updatePlayerOptions = (pool, currentSelectedPlayers) => {
        const selectedPlayerNames = currentSelectedPlayers.map(p => p.name);
        const filteredOptions = {};
        
        ['$3', '$2', '$1', '$0'].forEach(category => {
            if (pool[category]) {
                const availablePlayers = pool[category].filter(player => 
                    !selectedPlayerNames.includes(player.name)
                );
                filteredOptions[category] = availablePlayers.map(player => ({
                        ...player,
                        cost: parseInt(category.replace('$', ''))
                }));
            } else {
                filteredOptions[category] = [];
            }
        });
        
        setPlayerOptions(filteredOptions);
    };

    const selectPlayer = (player) => {
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

        const newSelectedPlayers = [...selectedPlayers, player];
        setSelectedPlayers(newSelectedPlayers);
        setBudget(budget - player.cost);
        updatePlayerOptions(playerPool, newSelectedPlayers);  // Pass the updated selected players
        setError('');
    };

    const removePlayer = (playerName) => {
        if (isSimulated) {
            setError('Cannot remove players after simulation');
            return;
        }
        
        const player = selectedPlayers.find(p => p.name === playerName);
        if (player) {
            const newSelectedPlayers = selectedPlayers.filter(p => p.name !== playerName);
            setSelectedPlayers(newSelectedPlayers);
            setBudget(budget + player.cost);
            updatePlayerOptions(playerPool, newSelectedPlayers);
        }
    };

    const simulateTeam = async () => {
        if (selectedPlayers.length !== 5) {
            setError('Team must have exactly 5 players');
            return;
        }

        if (!nickname || nickname.trim() === '') {
            setError('Please enter your nickname before simulating');
            return;
        }

        try {
            console.log('Simulating team with players:', selectedPlayers.map(p => p.name));
            const response = await axios.post(`${API_URL}/simulate`, {
                players: selectedPlayers.map(p => p.name),
                player_name: nickname.trim()
            });
            
            console.log('Simulation response:', response.data);
            
            // Validate the response structure
            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Invalid response from server');
            }
            
            const requiredFields = ['wins', 'losses', 'win_probability', 'team_stats'];
            for (const field of requiredFields) {
                if (!(field in response.data)) {
                    throw new Error(`Missing required field in response: ${field}`);
                }
            }
            
            setRecord(response.data);
            setIsSimulated(true);
            setError('');
        } catch (error) {
            console.error('Error simulating team:', error);
            setError(`Error simulating team: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleImageError = (playerName) => {
        setImageErrors(prev => ({
            ...prev,
            [playerName]: true
        }));
    };

    return (
        <div className="team-builder">
            {isLoading ? (
                <div className="loading">Loading...</div>
            ) : (
                <>
                    <div className="team-section">
                        <h2>Selected Players</h2>
                        <div className="budget-display">
                            Remaining Budget: ${budget}
                        </div>
                        <div className="selected-players">
                            {selectedPlayers.map((player, index) => (
                                <div key={index} className="player-card">
                                    {!imageErrors[player.name] ? (
                                        <img 
                                            src={getPlayerImageUrl(player.name)} 
                                            alt={player.name} 
                                            className="player-image"
                                            onError={() => handleImageError(player.name)}
                                        />
                                    ) : (
                                        <div className="player-image-placeholder">
                                            {player.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="player-info">
                                        <h3>{player.name}</h3>
                                        <p>Cost: ${player.cost}</p>
                                    </div>
                                    <button 
                                        onClick={() => removePlayer(player.name)}
                                        className="remove-button"
                                        disabled={isSimulated}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        {selectedPlayers.length === 5 && !isSimulated && (
                            <div className="simulation-section">
                                <button 
                                    className="simulate-button"
                                    onClick={simulateTeam}
                                >
                                    Simulate Season
                                </button>
                                {error && <div className="error-message">{error}</div>}
                            </div>
                        )}
                        {record && (
                            <div className="record-display">
                                <h3>Season Record: {record.wins}-{record.losses}</h3>
                                <p>Win Probability: {(record.win_probability * 100).toFixed(1)}%</p>
                            </div>
                        )}
                    </div>

                    <div className="player-section">
                        <h2>Available Players</h2>
                        {Object.entries(playerOptions).map(([category, players]) => (
                            <div key={category} className="player-category">
                                <div className="category-header">{category} Players</div>
                                <div className="player-options">
                                    {players.map((player, index) => (
                                        <div key={index} className="player-option">
                                            {!imageErrors[player.name] ? (
                                                <img 
                                                    src={getPlayerImageUrl(player.name)} 
                                                    alt={player.name} 
                                                    className="player-image"
                                                    onError={() => handleImageError(player.name)}
                                                />
                                            ) : (
                                                <div className="player-image-placeholder">
                                                    {player.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="player-info">
                                                <h3>{player.name}</h3>
                                                <p>Cost: ${player.cost}</p>
                                            </div>
                                            <button 
                                                onClick={() => selectPlayer(player)}
                                                disabled={budget < player.cost || selectedPlayers.length >= 5 || isSimulated}
                                                className="select-button"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default TeamBuilder; 