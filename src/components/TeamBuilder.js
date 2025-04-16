import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeamBuilder.css';
import { playerIds } from '../playerIds';

// Get API URL from environment variable or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
        'Air Bud': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Air_Bud_poster.jpg/440px-Air_Bud_poster.jpg',
        'Michael Jordan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Michael_Jordan_in_2014.jpg/440px-Michael_Jordan_in_2014.jpg',
        'Kobe Bryant': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Kobe_Bryant_2015.jpg/440px-Kobe_Bryant_2015.jpg',
        'Shaquille O\'Neal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Shaquille_O%27Neal_2010.jpg/440px-Shaquille_O%27Neal_2010.jpg',
        'Magic Johnson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Magic_Johnson_2010.jpg/440px-Magic_Johnson_2010.jpg',
        'Larry Bird': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Larry_Bird_2010.jpg/440px-Larry_Bird_2010.jpg',
        'Bill Russell': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Bill_Russell_2010.jpg/440px-Bill_Russell_2010.jpg',
        'Wilt Chamberlain': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Wilt_Chamberlain_1960.jpg/440px-Wilt_Chamberlain_1960.jpg',
        'Tim Duncan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Tim_Duncan_2015.jpg/440px-Tim_Duncan_2015.jpg',
        'Kareem Abdul-Jabbar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Kareem_Abdul-Jabbar_2010.jpg/440px-Kareem_Abdul-Jabbar_2010.jpg',
        'Hakeem Olajuwon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Hakeem_Olajuwon_2010.jpg/440px-Hakeem_Olajuwon_2010.jpg',
        'Charles Barkley': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Charles_Barkley_2010.jpg/440px-Charles_Barkley_2010.jpg',
        'Dennis Rodman': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Dennis_Rodman_2010.jpg/440px-Dennis_Rodman_2010.jpg',
        'Scottie Pippen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Scottie_Pippen_2010.jpg/440px-Scottie_Pippen_2010.jpg',
        'John Stockton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/John_Stockton_2010.jpg/440px-John_Stockton_2010.jpg',
        'Karl Malone': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Karl_Malone_2010.jpg/440px-Karl_Malone_2010.jpg',
        'David Robinson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/David_Robinson_2010.jpg/440px-David_Robinson_2010.jpg',
        'Patrick Ewing': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Patrick_Ewing_2010.jpg/440px-Patrick_Ewing_2010.jpg',
        'Reggie Miller': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Reggie_Miller_2010.jpg/440px-Reggie_Miller_2010.jpg',
        'Gary Payton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Gary_Payton_2010.jpg/440px-Gary_Payton_2010.jpg',
        'Jason Kidd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jason_Kidd_2010.jpg/440px-Jason_Kidd_2010.jpg',
        'Steve Nash': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Steve_Nash_2010.jpg/440px-Steve_Nash_2010.jpg',
        'Dirk Nowitzki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Dirk_Nowitzki_2010.jpg/440px-Dirk_Nowitzki_2010.jpg',
        'Kevin Garnett': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Kevin_Garnett_2010.jpg/440px-Kevin_Garnett_2010.jpg',
        'Ray Allen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ray_Allen_2010.jpg/440px-Ray_Allen_2010.jpg',
        'Paul Pierce': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Paul_Pierce_2010.jpg/440px-Paul_Pierce_2010.jpg',
        'Tony Parker': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tony_Parker_2010.jpg/440px-Tony_Parker_2010.jpg',
        'Manu Ginobili': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Manu_Ginobili_2010.jpg/440px-Manu_Ginobili_2010.jpg',
        'Dwyane Wade': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Dwyane_Wade_2010.jpg/440px-Dwyane_Wade_2010.jpg',
        'Chris Bosh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Chris_Bosh_2010.jpg/440px-Chris_Bosh_2010.jpg',
        'Chris Paul': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Chris_Paul_2010.jpg/440px-Chris_Paul_2010.jpg',
        'Carmelo Anthony': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Carmelo_Anthony_2010.jpg/440px-Carmelo_Anthony_2010.jpg',
        'Dwight Howard': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Dwight_Howard_2010.jpg/440px-Dwight_Howard_2010.jpg',
        'Derrick Rose': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Derrick_Rose_2010.jpg/440px-Derrick_Rose_2010.jpg',
        'Blake Griffin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Blake_Griffin_2010.jpg/440px-Blake_Griffin_2010.jpg',
        'Russell Westbrook': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Russell_Westbrook_2010.jpg/440px-Russell_Westbrook_2010.jpg',
        'James Harden': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/James_Harden_2010.jpg/440px-James_Harden_2010.jpg',
        'Klay Thompson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Klay_Thompson_2010.jpg/440px-Klay_Thompson_2010.jpg',
        'Draymond Green': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Draymond_Green_2010.jpg/440px-Draymond_Green_2010.jpg',
        'Kawhi Leonard': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Kawhi_Leonard_2010.jpg/440px-Kawhi_Leonard_2010.jpg',
        'Paul George': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Paul_George_2010.jpg/440px-Paul_George_2010.jpg',
        'Damian Lillard': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Damian_Lillard_2010.jpg/440px-Damian_Lillard_2010.jpg',
        'Jimmy Butler': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jimmy_Butler_2010.jpg/440px-Jimmy_Butler_2010.jpg',
        'Kyrie Irving': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Kyrie_Irving_2010.jpg/440px-Kyrie_Irving_2010.jpg',
        'Gordon Hayward': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Gordon_Hayward_2010.jpg/440px-Gordon_Hayward_2010.jpg',
        'Kemba Walker': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Kemba_Walker_2010.jpg/440px-Kemba_Walker_2010.jpg',
        'Bradley Beal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bradley_Beal_2010.jpg/440px-Bradley_Beal_2010.jpg',
        'John Wall': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/John_Wall_2010.jpg/440px-John_Wall_2010.jpg',
        'DeMarcus Cousins': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/DeMarcus_Cousins_2010.jpg/440px-DeMarcus_Cousins_2010.jpg',
        'Anthony Davis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Anthony_Davis_2010.jpg/440px-Anthony_Davis_2010.jpg',
        'Rudy Gobert': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Rudy_Gobert_2010.jpg/440px-Rudy_Gobert_2010.jpg',
        'Donovan Mitchell': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Donovan_Mitchell_2010.jpg/440px-Donovan_Mitchell_2010.jpg',
        'Ben Simmons': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ben_Simmons_2010.jpg/440px-Ben_Simmons_2010.jpg',
        'Jayson Tatum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jayson_Tatum_2010.jpg/440px-Jayson_Tatum_2010.jpg',
        'Jaylen Brown': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jaylen_Brown_2010.jpg/440px-Jaylen_Brown_2010.jpg',
        'Trae Young': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Trae_Young_2010.jpg/440px-Trae_Young_2010.jpg',
        'Luka Doncic': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Luka_Doncic_2010.jpg/440px-Luka_Doncic_2010.jpg',
        'Zion Williamson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Zion_Williamson_2010.jpg/440px-Zion_Williamson_2010.jpg',
        'Ja Morant': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ja_Morant_2010.jpg/440px-Ja_Morant_2010.jpg',
        'Jaren Jackson Jr.': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jaren_Jackson_Jr._2010.jpg/440px-Jaren_Jackson_Jr._2010.jpg',
        'Shai Gilgeous-Alexander': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Shai_Gilgeous-Alexander_2010.jpg/440px-Shai_Gilgeous-Alexander_2010.jpg',
        'De\'Aaron Fox': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/De%27Aaron_Fox_2010.jpg/440px-De%27Aaron_Fox_2010.jpg',
        'Bennedict Mathurin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bennedict_Mathurin_2010.jpg/440px-Bennedict_Mathurin_2010.jpg',
        'Kyle Filipowski': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Kyle_Filipowski_2010.jpg/440px-Kyle_Filipowski_2010.jpg',
        'Stephon Castle': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Stephon_Castle_2010.jpg/440px-Stephon_Castle_2010.jpg',
        'Dalton Knecht': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Dalton_Knecht_2010.jpg/440px-Dalton_Knecht_2010.jpg'
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

const TeamBuilder = () => {
    const [playerPool, setPlayerPool] = useState({});
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [playerOptions, setPlayerOptions] = useState({});
    const [budget, setBudget] = useState(100);
    const [record, setRecord] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');
    const [isSimulated, setIsSimulated] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const [imageSources, setImageSources] = useState({});
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

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
        
        // Create a new object to store filtered players by category
        const filteredOptions = {};
        
        // Process each cost category
        ['$3', '$2', '$1', '$0'].forEach(category => {
            if (pool[category]) {
                // Filter out players that are already selected
                const availablePlayers = pool[category].filter(player => 
                    !selectedPlayerNames.includes(player.name)
                );
                
                console.log(`Category ${category}: ${availablePlayers.length} available players`);
                
                // Add available players to options with their cost
                filteredOptions[category] = availablePlayers.map(player => ({
                    ...player,
                    cost: parseInt(category.replace('$', ''))
                }));
            } else {
                filteredOptions[category] = [];
            }
        });
        
        console.log('Final player options:', filteredOptions);
        setPlayerOptions(filteredOptions);
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

    const getPlayerImageSources = (playerName) => {
        if (imageSources[playerName]) {
            return imageSources[playerName];
        }

        const sources = [];
        
        // For NBA players, try multiple sources
        const nbaPlayers = [
            'Kevin Durant', 'LeBron James', 'Stephen Curry', 'Giannis Antetokounmpo', 
            'Luka Doncic', 'Joel Embiid', 'Jayson Tatum', 'Devin Booker', 
            'Anthony Edwards', 'Karl-Anthony Towns', 'Cade Cunningham', 'Naz Reid',
            'Josh Giddey', 'Scottie Barnes', 'Stephon Castle', 'Jaren Jackson Jr.',
            'Donte DiVincenzo', 'Andrew Nembhard', 'Duncan Robinson', 'Royce O\'Neale',
            'Dalton Knecht', 'De\'Aaron Fox', 'Bennedict Mathurin', 'Kyle Filipowski'
        ];
        
        if (nbaPlayers.includes(playerName)) {
            // Create a player ID based on the name
            const playerId = playerName
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/\./g, '')
                .replace(/'/g, '')
                .replace(/"/g, '');
                
            // Try ESPN first
            sources.push(`https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/${playerId}.png&w=350&h=254`);
            
            // Try NBA.com as fallback
            const nbaId = playerName.replace(/\s+/g, '').replace(/\./g, '').replace(/'/g, '');
            sources.push(`https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`);
            
            // Try Basketball Reference as another fallback
            sources.push(`https://www.basketball-reference.com/req/202106291/images/players/${playerId}.jpg`);
        } else {
            // For fictional players, use placeholder images
            sources.push(getPlayerImageUrl(playerName));
        }
        
        // Store the sources for this player
        setImageSources(prev => ({
            ...prev,
            [playerName]: sources
        }));
        
        return sources;
    };

    const handleImageError = (playerName) => {
        setImageErrors(prev => ({
            ...prev,
            [playerName]: true
        }));
    };

    useEffect(() => {
        fetchDailyChallenge();
    }, []);

    const fetchDailyChallenge = async () => {
        try {
            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/challenge/${today}`);
            const data = await response.json();
            if (response.ok) {
                setDailyChallenge(data);
                setBudget(data.budget);
                // Load the player pool for the daily challenge
                const playerPoolResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/player_pool`);
                const playerPool = await playerPoolResponse.json();
                setPlayerOptions(playerPool);
            }
        } catch (error) {
            console.error('Error fetching daily challenge:', error);
        }
    };

    const handlePlayerSelect = (player) => {
        if (selectedPlayers.length < 5 && !selectedPlayers.includes(player)) {
            setSelectedPlayers([...selectedPlayers, player]);
            updatePlayerOptions(player);
        }
    };

    const handlePlayerRemove = (playerToRemove) => {
        setSelectedPlayers(selectedPlayers.filter(player => player !== playerToRemove));
        setPlayerOptions([...playerOptions, playerToRemove]);
    };

    const updatePlayerOptionsForDailyChallenge = (selectedPlayer) => {
        setPlayerOptions(playerOptions.filter(player => player !== selectedPlayer));
    };

    const simulateTeamForDailyChallenge = async () => {
        if (selectedPlayers.length !== 5) {
            alert('Please select exactly 5 players.');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/simulate_team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ players: selectedPlayers }),
            });

            const data = await response.json();
            if (response.ok) {
                setRecord(data.record);
                
                // If this is a daily challenge, submit the team
                if (dailyChallenge) {
                    submitDailyChallenge(data.record);
                }
            }
        } catch (error) {
            console.error('Error simulating team:', error);
        }
    };

    const submitDailyChallenge = async (teamRecord) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/submit_team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    team: selectedPlayers,
                    date: today,
                    record: teamRecord
                }),
            });

            if (response.ok) {
                setIsSubmitted(true);
            }
        } catch (error) {
            console.error('Error submitting daily challenge:', error);
        }
    };

    return (
        <div className="team-builder">
            {dailyChallenge && (
                <div className="daily-challenge">
                    <h2>Daily Challenge</h2>
                    <p>{dailyChallenge.description}</p>
                    {isSubmitted && (
                        <div className="submission-success">
                            <p>Team submitted successfully! Check back tomorrow for a new challenge.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="team-section">
                <h2>Selected Players</h2>
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
                                onClick={() => handlePlayerRemove(player)}
                                className="remove-button"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="simulation-section">
                    {selectedPlayers.length === 5 && !isSubmitted && (
                        <button 
                            className="simulate-button"
                            onClick={simulateTeamForDailyChallenge}
                        >
                            Simulate Season
                        </button>
                    )}
                    {record && (
                        <div className="record-display">
                            <h3>Season Record: {record.record}</h3>
                        </div>
                    )}
                </div>
            </div>

            <div className="player-pool">
                <h2>Available Players</h2>
                <div className="player-options">
                    {playerOptions.map((player, index) => (
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
                                onClick={() => handlePlayerSelect(player)}
                                className="select-button"
                            >
                                Select
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamBuilder; 