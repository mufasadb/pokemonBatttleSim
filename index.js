const Tools = require('./tools');
const PKTMN = require('./monGen');
const Move = require('./moveHelper');
const Turn = require('./turn')
const Remember = require('./dataGatherer')
require("dotenv").config();
const colourFetch = require("./helpers/pokemonTypeColor");


const plotlyKey = process.env.PLOTLYKEY

const plotly = require('plotly')("callmebeachy", plotlyKey)


const fs = require('fs');


let wins = 0
let losses = 0

Tools.calcSettings.useAccuracy = true;



const fromTime = new Date().getTime()


//Each change is + or - 1, the higher this value, the less any individual change alters the weighting
const initValueForWeighting = 100;
const numberOfIterationsInTestFight = 10000000;
const turnsBeforeCallDraw = 70






function fight(teamOne, teamTwo) {
    let teams = [teamOne, teamTwo]
    let teamOnePokemonOut = teamOne[0];
    let teamTwoPokemonOut = teamTwo[1];
    let winner = { decided: false, index: -1 }
    let result = { winnerIndex: -1, winningTeam: [], losingTeam: [] }

    for (let i = 0; i < turnsBeforeCallDraw; i++) {
        Turn.turn(teamOnePokemonOut, teamTwoPokemonOut)
        teamOnePokemonOut = checkFaintAndReDeploy(teamOne, teamOnePokemonOut);
        if (!teamOnePokemonOut) {
            winner.decided = true
            winner.index = 1
            result.winningTeam = teams[1]
            result.losingTeam.push(teams[0])
            wins = wins + teamTwo.length
            losses = losses + teamOne.length
        }
        teamTwoPokemonOut = checkFaintAndReDeploy(teamTwo, teamTwoPokemonOut);
        if (!teamTwoPokemonOut) {
            result.winningTeam = teams[0]
            result.losingTeam.push(teams[1])
            winner.index = 0;
            winner.decided = true
            wins = wins + teamOne.length
            losses = losses + teamTwo.length
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
    losses = losses + teamTwo.length + teamOne.length
    Remember.score.totalTurnsToWin = Remember.score.totalTurnsToWin + turnsBeforeCallDraw
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


let countOfLosingTeams = 0
let totalTeamsCount = 0

for (let i = 0; i < numberOfIterationsInTestFight; i++) {
    let teamOne = PKTMN.buildTeam();
    let teamTwo = PKTMN.buildTeam();
    let fightResult = fight(teamOne, teamTwo)

    Remember.score.played++
    totalTeamsCount = totalTeamsCount + fightResult.losingTeam.length

    if (fightResult.winnerIndex == 0) { Remember.score.teamOneWins++ }
    else { Remember.score.teamTwoWins++ }
    if (fightResult.winningTeam.length > 0) {
        Remember.score.wins++
        for (mon of fightResult.winningTeam) {

            Remember.rememberMonResult(mon, true)
            Remember.score.pokemonWins++
        }

    }

    for (team of fightResult.losingTeam) {

        Remember.score.losses++
        for (mon of team) {
            Remember.score.pokemonLosses++
            Remember.rememberMonResult(mon, false)

        }

    }
}




console.log(`The run is now finished, a total of ${Remember.monData.length} different pmon were used`)
console.log(`A total of ${Remember.moveDamageData().length} different moves were used `)

let plotable = logBestAndWorst(Remember.monData(), 3, "Mons")
let plotableDamage = logBestAndWorst(Remember.moveDamageData(), 3, "Moves")



function logBestAndWorst(list, count, nameOfList) {
    let dataX = []
    let dataY = []
    let dataText = []
    console.log(`The worst ${count} ${nameOfList} were:`)
    for (let i = 0; i < count; i++) {
        dataX.push(list[i].name)
        dataY.push(Math.round((list[i].winCount / (list[i].winCount + list[i].lossCount) * 100)))
        console.log(`${list[i].name} with a win ratio of  of ${Math.round((list[i].winCount / (list[i].winCount + list[i].lossCount) * 100))}%`)
        if (nameOfList == "Moves") {
            console.log(`${list[i].damage}`)
            dataText.push(`${list[i].damage} damage`)

        }

    }
    console.log("-")
    console.log(`The best ${count} ${nameOfList} were`)
    for (let i = list.length - 1; i > list.length - count - 1; i--) {
        dataX.push(list[i].name)
        dataY.push(Math.round((list[i].winCount / (list[i].winCount + list[i].lossCount) * 100)))
        console.log(`${list[i].name} with a win ratio of  of ${Math.round((list[i].winCount / (list[i].winCount + list[i].lossCount) * 100))}%`)
        if (nameOfList == "Moves") {
            dataText.push(`${list[i].damage} damage`)
            console.log(`${list[i].damage}`)
        }
        if (nameOfList == "Mons") {
            console.log(`best Move of ${list[i].sortedMoves[0].name}`)
            // dataText.push(`with best move ${list[i].sortedMoves[0]}`)
        }
    }
    console.log("-");
    return {x: dataX, y: dataY, text: dataText, type:"bar"}
}


//print the round data

console.log(wins)
console.log(losses)

console.log(Remember.score)

console.log(Remember.score.totalTurnsToWin / Remember.score.played)

const toTime = new Date().getTime()
const timeDiff = (toTime - fromTime) / 1000
console.log(`That took ${timeDiff} seconds`)
// Remember.graph();

// var data = [{ x: [0, 1, 2], y: [3, 2, 1], type: 'bar' }];
var layout = { title: "Mons by win percent", fileopt: "overwrite", filename: "pokemon" };

// plotly.plot(plotable, layout, function (err, msg) {
//     if (err) return console.log(err);
//     // console.log(msg);
// });

// var layout = {
//     title: "Damage Dealt",
//     font: {family: "Raleway, sans-serif"},
//     showlegend: false,
//     xaxis: {tickangle: -45},
//     yaxis: {
//       zeroline: false,
//       gridwidth: 2
//     },
//     bargap: 0.05,
//     filename: "moveset"
//   };plotly.plot(plotableDamage, layout, function (err, msg) {
//     if (err) return console.log(err);
//     // console.log(msg);
// });