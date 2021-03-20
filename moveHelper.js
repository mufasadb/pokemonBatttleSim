const fs = require('fs')
const Tools = require('./tools')

let rawMoveData = fs.readFileSync(`./moveData.json`)
let parsedMoveData = JSON.parse(rawMoveData);

function addRandomMoves(pmon, level, useTM) {
    let possibleMoves = []
    let pokeData = Tools.lookupPokemon(pmon);
    for (const [key, value] of Object.entries(pokeData.levelUpMoves)) {
        if (key < level) {
            for (move of value) {
                if (!possibleMoves.includes(move)) {
                    possibleMoves.push(move)
                }
            }
        }
    }
    if (useTM) {
        for (move of pokeData.tmMoves) {
            if (!possibleMoves.includes(move)) {
                possibleMoves.push(move)
            }
        }
    }
    let selectedMoves = []
    let finalMoves = []
    let stop = 4
    if (possibleMoves.length < 4) { stop = possibleMoves.length }
    for (let i = 0; i < stop; i++) {
        let selected = Tools.randomFromList(possibleMoves)
        if (selectedMoves.includes(selected)) {
            i--
        } else {
            selectedMoves.push(selected);
            finalMoves.push(getMoveDetails(selected))
        }

    }
    return selectedMoves
}



function getMoveDetails(moveName) {
    let moveData = parsedMoveData.find(m => { return m.Name === moveName })
    if (!moveData) {
        console.log(new Error(`couldn't find move ${moveName}`)
        )
    }
    let move = {
        name: moveName,
        type: moveData.Type,
        category: moveData.Category,
        PP: moveData.PP,
        power: moveData.Power,
        accuracy: moveData.Accuracy,
        status: moveData.status,
        statusChance: moveData.statusChance,
        effects: moveData.effects,
        selfEffects: moveData.selfEffects,
        hitCount: moveData.hitCount,
        hitRepeatCount: moveData.hitRepeatCount,
        selfStatus: moveData.selfStatus,
        heal: moveData.heal
    }
    return move
}


function getMovePP(moves) { 
    let ppArray = []
    for (move of moves) { 
        let moveData = parsedMoveData.find(m => { return m.Name === move })
        ppArray.push(moveData.PP)
    }
    return ppArray
}
module.exports = { 

    moveDetails: (moveName) => { return getMoveDetails(moveName) },
    randomMoveGen: (monName, level, useTM) => { return addRandomMoves(monName, level, useTM) },
    getPP: (moves) => { return getMovePP(moves)}

}