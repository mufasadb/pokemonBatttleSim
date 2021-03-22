const Tools = require('./tools');
const PKTMN = require('./monGen');
const TeamBattle = require("./teamBattle")

const Remember = require('./dataGatherer')
require("dotenv").config();
const colourFetch = require("./helpers/pokemonTypeColor");


const plotlyKey = process.env.PLOTLYKEY

const plotly = require('plotly')("callmebeachy", plotlyKey)


const fs = require('fs');



Tools.calcSettings.useAccuracy = true;
const fightSettings = {
    turnsBeforeCallDraw: 100,
    numberOfIterationsInTestFight: 10000,
}


const fromTime = new Date().getTime()


//Each change is + or - 1, the higher this value, the less any individual change alters the weighting







let totalTeamsCount = 0

for (let i = 0; i < fightSettings.numberOfIterationsInTestFight; i++) {
    let teamOne = PKTMN.buildTeam(1);
    let teamTwo = PKTMN.buildTeam(2);
    let fightResult = TeamBattle.fight(teamOne, teamTwo, fightSettings)

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

logBestAndWorst(Remember.monData(), 10, "Mons")
logBestAndWorst(Remember.moveDamageData(), 10, "Moves")



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
            console.log(`${list[i].damage} damage and ${list[i].useCount} uses`)
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
            console.log(`${list[i].damage} damage and ${list[i].useCount} uses`)
        }
        if (nameOfList == "Mons") {
            console.log(`best Move of ${list[i].sortedMoves[0].name}`)
            // dataText.push(`with best move ${list[i].sortedMoves[0]}`)
        }
    }
    console.log("-");
    return { x: dataX, y: dataY, text: dataText, type: "bar" }
}


let monData = Remember.monData()
console.log(monData[monData.length - 1])


//print the round data
console.log(`${(Remember.score.lossCount - Remember.score.winCount) / 2} ties out of ${Remember.score.played} battles`)
console.log(`Average Rounds per battle: ${Remember.score.totalTurnsToWin / Remember.score.played}`)
console.log(`HitRate Average: ${Remember.score.hitCount / (Remember.score.missCount + Remember.score.hitCount)}`)
console.log(`Team one Win%: ${Remember.score.teamOneWins/(Remember.score.teamOneWins+Remember.score.teamTwoWins)*100}`)
console.log(Remember.teamStats)



const toTime = new Date().getTime()
const timeDiff = (toTime - fromTime) / 1000
console.log(`It took ${timeDiff} seconds to run`)
