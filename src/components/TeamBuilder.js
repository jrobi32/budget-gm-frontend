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
            const response = await axios.get(`${API_URL}/api/player_pool`);
            if (!response.data || Object.keys(response.data).length === 0) {
                throw new Error('Empty player pool received');
            }
            setPlayerPool(response.data);
            updatePlayerOptions(response.data, []);  // Pass empty selected players initially
            setError('');
        } catch (error) {
            console.error('Error loading player pool:', error);
            setError(`Error loading player pool: ${error.message}`);
            setPlayerOptions({
                '$3': [],
                '$2': [],
                '$1': [],
                '$0': []
            });
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
        const player = selectedPlayers.find(p => p.name === playerName);
        if (player) {
            const newSelectedPlayers = selectedPlayers.filter(p => p.name !== playerName);
            setSelectedPlayers(newSelectedPlayers);
            setBudget(budget + player.cost);
            updatePlayerOptions(playerPool, newSelectedPlayers);  // Pass the updated selected players
        }
    };

    const simulateTeam = async () => {
        if (selectedPlayers.length !== 5) {
            setError('Team must have exactly 5 players');
            return;
        }

        try {
            console.log('Simulating team with players:', selectedPlayers.map(p => p.name));
            const response = await axios.post(`${API_URL}/api/simulate`, {
                players: selectedPlayers.map(p => p.name)
            });
            
            console.log('Simulation response:', response.data);
            if (!response.data || !response.data.wins || !response.data.losses) {
                throw new Error('Invalid response from server');
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
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        {selectedPlayers.length === 5 && !isSimulated && (
                            <button 
                                className="simulate-button"
                                onClick={simulateTeam}
                            >
                                Simulate Season
                            </button>
                        )}
                        {record && (
                            <div className="record-display">
                                <h3>Season Record: {record.wins}-{record.losses}</h3>
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
                                                disabled={budget < player.cost || selectedPlayers.length >= 5}
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