const Remember = require("./dataGatherer")
const Turn = require('./turn')
const Tools = require("./tools")


function fight(teamOne, teamTwo, fightSettings) {
    let teams = [teamOne, teamTwo]
    let teamOnePokemonOut = teamOne[0];
    let teamTwoPokemonOut = teamTwo[1];
    let winner = { decided: false, index: -1 }
    let result = { winnerIndex: -1, winningTeam: [], losingTeam: [] }

    for (let i = 0; i < fightSettings.turnsBeforeCallDraw; i++) {
        Turn.turn(teamOnePokemonOut, teamTwoPokemonOut)
        teamOnePokemonOut = checkFaintAndReDeploy(teamOne, teamOnePokemonOut);
        if (!teamOnePokemonOut) {
            winner.decided = true
            winner.index = 1
            result.winningTeam = teams[1]
            result.losingTeam.push(teams[0])
        }
        teamTwoPokemonOut = checkFaintAndReDeploy(teamTwo, teamTwoPokemonOut);
        if (!teamTwoPokemonOut) {
            result.winningTeam = teams[0]
            result.losingTeam.push(teams[1])
            winner.index = 0;
            winner.decided = true
        }

        if (winner.decided) {
            result.winnerIndex = winner.index
            Remember.score.totalTurnsToWin = Remember.score.totalTurnsToWin + i
            return result
        }
    }
    Remember.score.losses++
    Remember.score.losses++
    result.losingTeam = teams
    Remember.score.totalTurnsToWin = Remember.score.totalTurnsToWin + fightSettings.turnsBeforeCallDraw
    return result
}

function checkFaintAndReDeploy(team, selected) {
    if (selected.faint) {
        let teamOptions = []
        for (mon of team) {
            mon.faint ? "" : teamOptions.push(mon);
        }
        if (teamOptions.length < 1) {
            // console.log('returning false')
            return false
        } else {
            return (Tools.randomFromList(teamOptions))
        }
    } else { return selected }
}
module.exports = {
    fight: (teamOne, teamTwo, fightSettings) => { return fight(teamOne, teamTwo, fightSettings) }
}