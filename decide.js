const Move = require('./moveHelper');
const Remember = require('./dataGatherer')
const Tools = require("./tools")
const valueSettings = Tools.decideValueSettings
const fs = require("fs");
let rawTypeData = fs.readFileSync('./typeChart.json')
let typeChart = JSON.parse(rawTypeData);

function moveVacuumWeight(attacker, moveIndex, attackMove) {

    //the goal here will be to get various stats and turn them into ratings close to the value of 100 as the normal
    let rememberedData = Remember.getMoveDataForMon(attacker.moves[moveIndex], attacker.name)
    let timesPlayedMon = rememberedData.relevantMoveData.winCount + rememberedData.relevantMoveData.lossCount
    if (attackMove.power === "-") { attackMove.power = 0 };
    if (attackMove.accuracy === "-") { attackMove.accuracy = 100 }
    let statCount = 0
    for (stat of Object.values(rememberedData.genericMoveData.statusInfliction)) {
        statCount = statCount + stat
    }
    if (!attackMove.selfDamage) { attackMove.selfDamage = 0 }
    if (!rememberedData.relevantMoveData) { console.log(rememberedData) }
    let ppRating = attacker.pp[moveIndex] * 5 * valueSettings.pp
    let genericDamageRating = rememberedData.genericMoveData.damage / rememberedData.genericMoveData.useCount * valueSettings.genericDamage
    let genericWinRating = rememberedData.genericMoveData.winCount / timesPlayedMon * valueSettings.genericWin
    let hasStatRating = statCount / rememberedData.genericMoveData.useCount * 100 * valueSettings.hasStat
    let localWinRating = rememberedData.relevantMoveData.winCount / timesPlayedMon * 200 * valueSettings.localWin
    if (Number.isNaN(localWinRating)) { localWinRating = 1 }
    if (Number.isNaN(genericWinRating)) { genericWinRating = 1 }
    let localuseRating = (rememberedData.relevantMoveData.useCount / timesPlayedMon) * 100 / (Remember.score.totalTurnsToWin / Remember.score.played) * valueSettings.localUse
    let powerRating = attackMove.power * valueSettings.power
    let accuracyRating = attackMove.accuracy / 100 * valueSettings.accuracy
    let selfDamageRating = attackMove.selfDamage * valueSettings.selfDamage
    let selfBuffRatings = { defence: 0, attack: 0, speed: 0, specialAttack: 0, specialDefense: 0, accuracy: 0, evasion: 0 }
    let enemeyBuffRatings = { defence: 0, attack: 0, speed: 0, specialAttack: 0, specialDefense: 0, accuracy: 0, evasion: 0 }

    for (stat in selfBuffRatings) {
        for (moveStat of attackMove.selfEffects) {
            if (moveStat.stat == stat) {
                let statChance = moveStat.chance ? moveStat.chance : 1
                selfBuffRatings[stat] = moveStat.stages * statChance * 100;
            }
        }
        selfBuffRatings[stat] = selfBuffRatings[stat] * valueSettings.selfBuff[stat]
    }
    for (stat in enemeyBuffRatings) {
        for (moveStat of attackMove.effects) {
            if (moveStat.stat == stat) {
                let statChance = moveStat.chance ? moveStat.chance : 1
                selfBuffRatings[stat] = moveStat.stages * statChance * 100;
            }
        }
        selfBuffRatings[stat] = selfBuffRatings[stat] * valueSettings.enemeyBuff[stat]
    }

    let totalSelfBuffRating = 0
    let totalEnemyBuffRatings = 0
    for (stat of Object.values(selfBuffRatings)) {
        totalSelfBuffRating = totalSelfBuffRating + stat
    }
    for (stat of Object.values(enemeyBuffRatings)) {
        totalEnemyBuffRatings = totalEnemyBuffRatings + stat
    }

    let stabRating = 0
    for (type of attacker.types) {
        if (attackMove.type === type) {
            stabRating = 100
        }
    }
    stabRating = stabRating * valueSettings.stab
    let canStatusRating = { Paralysis: 0, Confusion: 0, Burn: 0, Poison: 0, Freeze: 0, Sleep: 0, }
    for (statIndex in attackMove.status) {
        canStatusRating[attackMove.status[statIndex]] = attackMove.statusChance[statIndex]
    }
    let poisonRating = canStatusRating.Poison * valueSettings.Poison
    let paralysisRating = canStatusRating.Paralysis * valueSettings.Paralysis
    let confusonRating = canStatusRating.Confusion * valueSettings.Confusion
    let burnRating = canStatusRating.Burn * valueSettings.Burn
    let freezeRating = canStatusRating.Freeze * valueSettings.Freeze
    let sleepRating = canStatusRating.Sleep * valueSettings.Sleep

    let totalRating = totalEnemyBuffRatings + totalSelfBuffRating + powerRating + localuseRating + localWinRating + genericDamageRating + genericWinRating + hasStatRating + ppRating + poisonRating + paralysisRating + confusonRating + burnRating + freezeRating + sleepRating + stabRating + accuracyRating - selfDamageRating
    return totalRating
}


function valueMove(attacker, defender, index) {

    let attackMove = Move.moveDetails(attacker.moves[index])

    let isolatedRating = moveVacuumWeight(attacker, index, attackMove)
    let typeAdvantageRating = 1
    for (type of defender.types) {
        if (typeChart[type].weaknesses.includes(attackMove.type)) { typeAdvantageRating = typeAdvantageRating * 2 };

    }
    totalRating = isolatedRating + typeAdvantageRating
    return totalRating
}
function decideMove(attacker, defender) {
    let moveValues = []
    for (move in attacker.moves) {
        moveValues.push(valueMove(attacker, defender, move))
    }
    let chosenMove = -1
    for (move in moveValues) {
        if (attacker.pp[move] > 0) {
            if (chosenMove === -1) { chosenMove = 0 }
            if (moveValues[move] > moveValues[chosenMove]) { chosenMove = move }
        }
    }
    return chosenMove
}

module.exports = {
    move: (attacker, defender) => { return decideMove(attacker, defender) }
}