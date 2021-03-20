const Move = require('./moveHelper')
const fs = require('fs');
const Remember = require('./dataGatherer');
const Tools = require('./tools');

let rawTypeData = fs.readFileSync('./typeChart.json')
let typeChart = JSON.parse(rawTypeData);

let oneHits = ["Fissure", "Guillotine", "Horn Drill", "Sheer Cold"]

function calculateDamage(attacker, defender, attackerMoveIndex, weather) {
    //allow quick escape if confusion etc.
    if (chosenMove === -1) { 
        return {damage : 0}
    }
    let attackMove = Move.moveDetails(attacker.moves[attackerMoveIndex])

    let hit = true
    if (attackMove.heal == "50%") { 
        attacker.health = attacker.health + (attacker.maxHealth * 0.5)
    }
    //check if you should use accuracy
    if (Tools.calcSettings.useAccuracy) {
        let accuracy = 1

        if (attacker.accuracy != "-") {
            let stageMulti = Tools.calculateAccuracy(attacker.accuracyStage - defender.evasionStage)
            accuracy = attackMove.accuracy * stageMulti
        }
        if (Math.random() < accuracy * 1) {

        }
        else {
            hit = false
        }
    }

    if (hit) {
        if (attackMove.power == "-") {
            return { damage: 0 }
        } else {

            let attackPower = attacker.attack
            let rawDamage = (((((2 * attacker.level) / 5) + 2) * parseInt(attackMove.power) * attackPower / defender.defence) / 50) + 2

            let weatherMod = 1;
            let STAB = 1;
            let type = handleTypeModifier(attacker, defender, attackerMoveIndex);
            let burn = 1;
            let other = 1;

            if (attacker.status == "burn") { burn = 0.5}

            //TODO: impliment weather
            if (attacker.types.includes(attackMove.type)) { STAB = 1.5 }
            //capture data
            let finalDamage = Math.floor(rawDamage * weatherMod * STAB * type * burn * other)
            if (oneHits.includes(attackMove.name)) {
                finalDamage = defender.health
            }

            handleEffectsAndStatuses(attacker, defender, attackMove)
            Remember.rememberDamage(attacker.moves[attackerMoveIndex], finalDamage)
            return { damage: finalDamage }
        }
    }
    Remember.score.missCount++
    return { damage: 0 }
}

function handleTypeModifier(attacker, defender, attackerMoveIndex) {
    let typeMulti = 1;
    let attackType = attacker.moves[attackerMoveIndex].type
    for (type of defender.types) {
        if (!typeChart[type]) { console.log(new Error(`there was no type for the following ${attacker.name} or ${defender.name}`)); }
        if (typeChart[type].weaknesses.includes(attackType)) { typeMulti = typeMulti * 2 };
        if (typeChart[type].strengths.includes(attackType)) { typeMulti = typeMulti / 2 };
        if (typeChart[type].immunes.includes(attackType)) { typeMulti = 0 };
    }
    return typeMulti
}


function handleEffectsAndStatuses(attacker, defender, move) {
    if (move.effects.length > 0) {
        for (effect of move.effects) {
            let hits = true
            if (effect.chance) {
                if (effect.chance > Math.random()) {
                    hits = false
                }
            }
            if (hits) {
                defender[`${effect.stat}Stage`] = defender[`${effect.stat}Stage`] - effect.stages
            }
        }
    }
    if (move.status.length > 0) {
        for (i in move.status) {
            if (Math.random() < move.statusChance[i]) {
                defender.status = move.status[i]
                
            }
        }
    }
    if (move.selfEffects.length > 0) {
        for (effect of move.selfEffects) {
            let hits = true
            if (effect.chance) {
                if (effect.chance > Math.random()) {
                    hits = false
                }
            }
            if (hits) {
                attacker[`${effect.stat}Stage`] = attacker[`${effect.stat}Stage`] + effect.stages
            }
        }
    }
}

module.exports = {

    calculateDamage: (attacker, defender, attackerMoveIndex, weather) => {
        return calculateDamage(attacker, defender, attackerMoveIndex, weather)
    },

}