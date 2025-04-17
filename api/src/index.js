const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load player pool
const playerPoolPath = path.join(__dirname, '..', '..', 'public', 'player_pool.json');
let playerPool = {};
try {
    playerPool = JSON.parse(fs.readFileSync(playerPoolPath, 'utf8'));
} catch (error) {
    console.error('Error loading player pool:', error);
}

// League averages
const leagueAverages = {
    points: 110.0,
    rebounds: 44.0,
    assists: 24.0,
    steals: 7.5,
    blocks: 5.0,
    fg_pct: 0.46,
    ft_pct: 0.78,
    three_pct: 0.36
};

// Helper functions
function getRandomPlayers(category, count = 5) {
    if (!playerPool[category]) return [];
    const players = playerPool[category];
    if (players.length < count) return [];
    return players.sort(() => 0.5 - Math.random()).slice(0, count);
}

function calculateTeamStats(players) {
    const teamStats = {
        PTS: 0.0,
        REB: 0.0,
        AST: 0.0,
        STL: 0.0,
        BLK: 0.0,
        'FG%': 0.0,
        'FT%': 0.0,
        '3P%': 0.0
    };

    // Find players in pool
    const foundPlayers = [];
    for (const name of players) {
        let playerFound = false;
        for (const category of Object.values(playerPool)) {
            const player = category.find(p => p.name === name);
            if (player) {
                foundPlayers.push(player);
                playerFound = true;
                break;
            }
        }
        if (!playerFound) {
            console.error(`Player not found in pool: ${name}`);
            return null;
        }
    }

    if (foundPlayers.length !== players.length) {
        console.error("Not all players found in pool");
        return null;
    }

    // Calculate team stats
    const totalGames = foundPlayers.reduce((sum, player) => sum + player.GP, 0);
    if (totalGames === 0) {
        console.error("Total games played is 0");
        return null;
    }

    // Sum up counting stats
    for (const stat of ['PTS', 'REB', 'AST', 'STL', 'BLK']) {
        teamStats[stat] = foundPlayers.reduce((sum, player) => sum + player[stat], 0);
    }

    // Calculate shooting percentages
    const totalFgAttempts = foundPlayers.reduce((sum, player) => sum + player.FGA, 0);
    const totalFtAttempts = foundPlayers.reduce((sum, player) => sum + player.FTA, 0);
    const total3pAttempts = foundPlayers.reduce((sum, player) => sum + player['3PA'], 0);

    if (totalFgAttempts > 0) {
        teamStats['FG%'] = foundPlayers.reduce((sum, player) => sum + player.FGM, 0) / totalFgAttempts * 100;
    }
    if (totalFtAttempts > 0) {
        teamStats['FT%'] = foundPlayers.reduce((sum, player) => sum + player.FTM, 0) / totalFtAttempts * 100;
    }
    if (total3pAttempts > 0) {
        teamStats['3P%'] = foundPlayers.reduce((sum, player) => sum + player['3PM'], 0) / total3pAttempts * 100;
    }

    return teamStats;
}

function calculateWinProbability(teamStats) {
    const teamRating = (
        (teamStats.PTS / leagueAverages.points) * 0.3 +
        (teamStats.REB / leagueAverages.rebounds) * 0.2 +
        (teamStats.AST / leagueAverages.assists) * 0.2 +
        (teamStats.STL / leagueAverages.steals) * 0.1 +
        (teamStats.BLK / leagueAverages.blocks) * 0.1 +
        (teamStats['FG%'] / (leagueAverages.fg_pct * 100)) * 0.05 +
        (teamStats['3P%'] / (leagueAverages.three_pct * 100)) * 0.05
    );

    return 1 / (1 + Math.exp(-(teamRating - 1) * 3));
}

function simulateTeam(players) {
    const teamStats = calculateTeamStats(players);
    if (!teamStats) return null;

    const winProb = calculateWinProbability(teamStats);
    let wins = 0;
    let losses = 0;

    for (let i = 0; i < 82; i++) {
        if (Math.random() < winProb) {
            wins++;
        } else {
            losses++;
        }
    }

    return {
        wins,
        losses,
        win_probability: winProb,
        team_stats: teamStats
    };
}

// Routes
app.get('/.netlify/functions/api/player_pool', (req, res) => {
    try {
        const randomPool = {
            '$3': getRandomPlayers('$3'),
            '$2': getRandomPlayers('$2'),
            '$1': getRandomPlayers('$1'),
            '$0': getRandomPlayers('$0')
        };
        res.json(randomPool);
    } catch (error) {
        console.error('Error fetching player pool:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/.netlify/functions/api/simulate', (req, res) => {
    try {
        const { players, player_name } = req.body;

        if (!players || !Array.isArray(players)) {
            return res.status(400).json({ error: 'Missing players in request' });
        }

        if (players.length !== 5) {
            return res.status(400).json({ error: 'Team must have exactly 5 players' });
        }

        if (!player_name) {
            return res.status(400).json({ error: 'Missing player name' });
        }

        const result = simulateTeam(players);
        if (!result) {
            return res.status(500).json({ error: 'Failed to simulate team' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error in simulation:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports.handler = serverless(app); 