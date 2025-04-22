import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './TeamBuilder.css';
import { playerIds } from '../playerIds';
import { API_URL } from '../config';

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
    const playerId = playerIds[playerName];
    if (playerId) {
        return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;
    }
    
    // Fallback for any other players
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&background=1E88E5&color=fff&size=200&bold=true&format=svg`;
};

const PlayerCard = React.memo(({ player, onSelect, isSelected, onDeselect }) => {
    const handleClick = useCallback(() => {
        if (isSelected) {
            onDeselect(player);
        } else {
            onSelect(player);
        }
    }, [isSelected, onDeselect, player, onSelect]);

    return (
        <div className={`player-card ${isSelected ? 'selected' : ''}`} onClick={handleClick}>
            <div className="player-image">
                <img src={getPlayerImageUrl(player.name)} alt={player.name} />
            </div>
            <div className="player-info">
                <h3>{player.name}</h3>
                <p className="cost">Cost: {player.cost}</p>
                {player.stats && (
                    <div className="player-stats">
                        <p>PTS: {player.stats.PTS?.toFixed(1) || '0.0'}</p>
                        <p>AST: {player.stats.AST?.toFixed(1) || '0.0'}</p>
                        <p>REB: {player.stats.REB?.toFixed(1) || '0.0'}</p>
                        <p>STL: {player.stats.STL?.toFixed(1) || '0.0'}</p>
                        <p>BLK: {player.stats.BLK?.toFixed(1) || '0.0'}</p>
                        <p>FG%: {(player.stats.FG_PCT * 100)?.toFixed(1) || '0.0'}%</p>
                        <p>3P%: {(player.stats.FG3_PCT * 100)?.toFixed(1) || '0.0'}%</p>
                    </div>
                )}
            </div>
        </div>
    );
});

const TeamBuilder = ({ onError, nickname }) => {
    const [playerPool, setPlayerPool] = useState({});
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [playerOptions, setPlayerOptions] = useState([]);
    const [budget, setBudget] = useState(10);
    const [record, setRecord] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [simulationResults, setSimulationResults] = useState(null);
    const [rankings, setRankings] = useState(null);
    const [isSimulated, setIsSimulated] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    // Memoized function to filter players based on current state
    const filterPlayers = useCallback((pool, currentSelectedPlayers) => {
        const options = [];
        ['$3', '$2', '$1', '$0'].forEach(category => {
            if (pool[category]) {
                const players = pool[category].filter(player => 
                    !currentSelectedPlayers.some(p => p.name === player.name)
                );
                if (players.length > 0) {
                    options.push(...players.map(player => ({
                        ...player,
                        cost: parseInt(category.replace('$', ''))
                    })));
                }
            }
        });
        return options;
    }, []); // No dependencies needed as it's a pure function

    // Memoized function to update player options
    const updatePlayerOptions = useCallback((pool) => {
        const filteredOptions = filterPlayers(pool, selectedPlayers);
        setPlayerOptions(filteredOptions);
    }, [filterPlayers, selectedPlayers]);

    // Memoized function to load player pool
    const loadPlayerPool = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/player-pool`);
            const newPlayerPool = response.data;
            setPlayerPool(newPlayerPool);
            updatePlayerOptions(newPlayerPool);
            setError('');
        } catch (error) {
            setError('Error loading player pool: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    }, [updatePlayerOptions]);

    // Initial data loading effect
    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            if (isMounted) {
                await loadPlayerPool();
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [loadPlayerPool]);

    const getRandomPlayers = useCallback((category) => {
        if (!playerPool[category]) return [];
        const players = playerPool[category];
        if (players.length < 5) return players;
        return players.sort(() => 0.5 - Math.random()).slice(0, 5);
    }, [playerPool]);

    const selectPlayer = useCallback((player, category) => {
        if (isSimulated) {
            setError('Cannot make changes after simulation');
            return;
        }
        
        const cost = parseInt(category.replace('$', ''));
        
        if (selectedPlayers.length >= 5) {
            setError('You can only select 5 players!');
            return;
        }

        if (cost > budget) {
            setError(`Not enough budget! You need $${cost} but only have $${budget} remaining.`);
            return;
        }

        player.cost = category;
        setSelectedPlayers(prev => [...prev, player]);
        setBudget(prev => prev - cost);
        setError('');
    }, [budget, isSimulated, selectedPlayers.length]);

    const removePlayer = useCallback((playerName) => {
        if (isSimulated) {
            setError('Cannot remove players after simulation');
            return;
        }
        
        const player = selectedPlayers.find(p => p.name === playerName);
        if (player) {
            const newSelectedPlayers = selectedPlayers.filter(p => p.name !== playerName);
            setSelectedPlayers(newSelectedPlayers);
            setBudget(prev => prev + parseInt(player.cost.replace('$', '')));
            updatePlayerOptions(playerPool);
        }
    }, [isSimulated, playerPool, selectedPlayers, updatePlayerOptions]);

    const simulateTeam = useCallback(async () => {
        if (selectedPlayers.length !== 5) {
            setError('Team must have exactly 5 players');
            return;
        }

        if (!nickname || nickname.trim() === '') {
            setError('Please enter your nickname before simulating');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/simulate-team`, {
                players: selectedPlayers.map(p => ({
                    name: p.name,
                    cost: p.cost,
                    stats: p.stats || {}
                })),
                player_name: nickname.trim()
            });
            
            const data = response.data;
            if (!data || !data.wins || !data.losses) {
                throw new Error('Invalid response from server');
            }
            
            setSimulationResults(data);
            setIsSimulated(true);
            setError('');
        } catch (error) {
            console.error('Error simulating team:', error);
            setError(`Error simulating team: ${error.message}`);
        }
    }, [selectedPlayers, nickname]);

    const handleImageError = useCallback((playerName) => {
        setImageErrors(prev => ({
            ...prev,
            [playerName]: true
        }));
    }, []);

    const selectedPlayersList = useMemo(() => (
        selectedPlayers.map((player, index) => (
            <PlayerCard 
                key={index}
                player={player}
                onSelect={selectPlayer}
                onDeselect={removePlayer}
                isSelected={selectedPlayers.includes(player)}
            />
        ))
    ), [selectedPlayers, selectPlayer, removePlayer]);

    const playerOptionsList = useMemo(() => (
        playerOptions.map((player, index) => (
            <PlayerCard 
                key={index}
                player={player}
                onSelect={selectPlayer}
                onDeselect={removePlayer}
                isSelected={selectedPlayers.includes(player)}
            />
        ))
    ), [playerOptions, selectPlayer, removePlayer, selectedPlayers]);

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="team-builder">
            <div className="team-section">
                <h2>Your Team</h2>
                <div className="budget-display">
                    Remaining Budget: ${budget}
                </div>
                <div className="selected-players">
                    {selectedPlayersList}
                </div>
                {selectedPlayers.length === 5 && !isSimulated && (
                    <button 
                        className="simulate-button"
                        onClick={simulateTeam}
                        disabled={!nickname || nickname.trim() === ''}
                    >
                        Simulate Season
                    </button>
                )}
                {simulationResults && (
                    <div className="simulation-results">
                        <h3>Season Results</h3>
                        <p>Record: {simulationResults.wins}-{simulationResults.losses}</p>
                        <p>Win Probability: {(simulationResults.win_probability * 100).toFixed(1)}%</p>
                        {simulationResults.team_stats && (
                            <div className="team-stats">
                                <h4>Team Statistics</h4>
                                <p>Points per Game: {simulationResults.team_stats.PTS.toFixed(1)}</p>
                                <p>Assists per Game: {simulationResults.team_stats.AST.toFixed(1)}</p>
                                <p>Rebounds per Game: {simulationResults.team_stats.REB.toFixed(1)}</p>
                                <p>Steals per Game: {simulationResults.team_stats.STL.toFixed(1)}</p>
                                <p>Blocks per Game: {simulationResults.team_stats.BLK.toFixed(1)}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="player-section">
                <h2>Available Players</h2>
                {playerOptionsList}
            </div>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default TeamBuilder; 