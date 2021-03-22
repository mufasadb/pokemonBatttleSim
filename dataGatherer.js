// const moveDamageData = []
const moveDamageData = {}
const monData = {}
const score = {
    wins: 0,
    losses: 0,
    played: 0,
    teamOneWins: 0,
    teamTwoWins: 0,
    pokemonWins: 0,
    pokemonLosses: 0,
    totalTurnsToWin: 0,
    missCount: 0,
    hitCount: 0,
    accuracyTotal: 0
}

teamStats = {
    teamOneKills: 0,
    teamOneDeaths: 0,
}

let totalDamageDone = 0

function rememberDamage(moveName, damage) {
    checkAndCreateMove(moveName)
    moveDamageData[moveName].damage = moveDamageData[moveName].damage + damage
    moveDamageData[moveName].useCount++
    totalTurnsToWin = totalDamageDone + damage
}

function inflictedStatus(moveName, inflictedStatus) {
    checkAndCreateMove(moveName)
    moveDamageData[moveName].statusInfliction[inflictedStatus]++
}

function countMove(moveName, didWin) {
    checkAndCreateMove(moveName)
    if (didWin) {
        moveDamageData[moveName].winCount++
    } else { moveDamageData[moveName].lossCount++ }
}

function rememberMonResult(mon, didWin) {
    checkAndCreateMon(mon.name)
    if (didWin) {
        monData[mon.name].winCount++
    }
    else { monData[mon.name].lossCount++ }
    rememberMonSpecicificMove(mon, didWin)
}

function rememberMonSpecicificMove(mon, didWin) {
    for (move of mon.moves) {
        if (!monData[mon.name].moves[move]) {
            monData[mon.name].moves[move] = { name: move, winCount: 0, lossCount: 0, useCount: 0 }
        }
        if (didWin) {
            monData[mon.name].moves[move].winCount++
        } else {
            monData[mon.name].moves[move].lossCount++
        }
        countMove(move, didWin)
    }
}

function rememberMoveUseForMon(monName, moveName) {
    checkAndCreateMon(monName)
    if (!monData[monName].moves[moveName]) {
        monData[monName].moves[moveName] = { name: moveName, winCount: 0, lossCount: 0, useCount: 0 }
    }
    monData[monName].moves[moveName].useCount++
}


function returnMonDataSorted() {
    let returnArray = []
    returnArray = Object.values(monData)
    returnArray.sort((a, b) => (a.winCount / (a.winCount + a.lossCount) > b.winCount / (b.winCount + b.lossCount)) ? 1 : -1)
    sortMonMoves()
    return returnArray
}

function returnDamageDataSorted() {
    let returnArray = []
    returnArray = Object.values(moveDamageData)
    returnArray.sort((a, b) => (a.winCount / (a.winCount + a.lossCount) > b.winCount / (b.winCount + b.lossCount)) ? 1 : -1)
    return returnArray
}

function sortMonMoves() {
    for (mon of Object.values(monData)) {
        let returnArray = []
        returnArray = Object.values(mon.moves)
        returnArray.sort((a, b) => (a.winCount / (a.winCount + a.lossCount) > b.winCount / (b.winCount + b.lossCount)) ? -1 : 1)
        mon.sortedMoves = returnArray
    }
}

function recallMoveData(moveName, monName) {
    checkAndCreateMove(moveName)
    let moveData = moveDamageData[moveName]
    checkAndCreateMon(monName)
    if (!monData[monName].moves[moveName]) {
        monData[monName].moves[moveName] = { name: moveName, winCount: 0, lossCount: 0, useCount: 0 }
    }
    let monMoveData = monData[monName].moves[moveName]

    return { genericMoveData: moveData, relevantMoveData: monMoveData }
}

function checkAndCreateMon(monName) {
    if (!monData[monName]) {
        monData[monName] = { name: monName, moves: {}, useCount: 0, winCount: 0, lossCount: 0, deathCount: 0, killCount: 0 }
    }
}

function checkAndCreateMove(moveName) {
    if (!moveDamageData[moveName]) {
        moveDamageData[moveName] = { name: moveName, damage: 0, useCount: 1, winCount: 0, lossCount: 0, statusInfliction: { Paralysis: 0, Confusion: 0, Burn: 0, Poison: 0, Freeze: 0, Sleep: 0, } }
    }
}

function rememberLifeAndDeath(monName, isKill) {
    checkAndCreateMon(monName)
    if (isKill) {
        monData[monName].killCount++
    } else { monData[monName].deathCount++ }
}

function recordDeaths(teamNumber, isKill) {
    if (teamNumber == 1) {
        if (isKill) {
            teamStats.teamOneKills++
        } else { teamStats.teamOneDeaths++ }
    }
}

module.exports = {
    rememberDamage: (moveName, damage) => { rememberDamage(moveName, damage) },
    rememberMoveResult: (moveName, didWin) => { countMove(moveName, didWin) },
    rememberMonResult: (mon, didWin) => { rememberMonResult(mon, didWin) },
    moveDamageData: () => { return returnDamageDataSorted() },
    monData: () => { return returnMonDataSorted() },
    graph: () => {
        grapphingData();
    },
    rememberStatusInfliction: (moveName, statusInflicted) => { inflictedStatus(moveName, statusInflicted) },
    // monData.sort((a, b) => (a.winCount / (a.winCount + a.lossCount) > b.winCount / (b.winCount + b.lossCount)) ? 1 : -1),
    score: score,
    recallTotalDamage: totalDamageDone,
    getMoveDataForMon: (moveName, monName) => { return recallMoveData(moveName, monName) },
    recallMovesUsed: moveDamageData.length,
    rememberMonMoveUse: (monName, moveName) => { rememberMoveUseForMon(monName, moveName) },
    rememberDeath: (monName, teamNumber) => {
        rememberLifeAndDeath(monName, false)
        recordDeaths(teamNumber, false)
    },
    rememberKill: (monName, teamNumber) => {
        rememberLifeAndDeath(monName, true);
        recordDeaths(teamNumber, true)
    },
    teamStats: teamStats
}