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
    missCount: 0
}


function rememberDamage(moveName, damage) {
    if (!moveDamageData[moveName]) {
        moveDamageData[moveName] = { name: moveName, damage: 0, useCount: 1, winCount: 0, lossCount: 0 }
    }
    moveDamageData[moveName].damage = moveDamageData[moveName].damage + damage
}


function countMove(moveName, didWin) {
    if (!moveDamageData[moveName]) {
        moveDamageData[moveName] = { name: moveName, damage: 0, useCount: 1, winCount: 0, lossCount: 0 }

    }
    if (didWin) {
        moveDamageData[moveName].winCount++
    } else { moveDamageData[moveName].lossCount++ }
}

function rememberMonResult(mon, didWin) {
    // let indexOfMon = getMonIndex(mon.name)
    if (!monData[mon.name]) {
        monData[mon.name] = { name: mon.name, moves: {}, useCount: 0, winCount: 0, lossCount: 0 }
     }
    if (didWin) {
        monData[mon.name].winCount++
    }
    else { monData[mon.name].lossCount++ }
    rememberMonSpecicificMove(mon, didWin)
}

function rememberMonSpecicificMove(mon, didWin) {
    //this one is backwards because we're assuming we may have been passed an index frmo above
    
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
        returnArray.sort((a, b) => (a.winCount / (a.winCount + a.lossCount) > b.winCount / (b.winCount + b.lossCount)) ? 1 : -1)
        mon.sortedMoves = returnArray
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
    // monData.sort((a, b) => (a.winCount / (a.winCount + a.lossCount) > b.winCount / (b.winCount + b.lossCount)) ? 1 : -1),
    score: score
}