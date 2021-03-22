const fs = require('fs');


const calculationSettings = {
    useAccuracy: true
}

const decideValueSettings = {
    genericDamage: 1,
    genericWin: 1,
    hasStat: 1,
    localWin: 1,
    localUse: 1,
    pp: 1,
    accuracy: 1,
    power: 10,
    Paralysis: 1, Confusion: 1, Burn: 1, Poison: 1, Freeze: 1, Sleep: 1,
    stab: 1,
    selfDamage: 1,
    selfBuff: { defence: 1, attack: 1, speed: 1, specialAttack: 1, specialDefense: 1, accuracy: 1, evasion: 1 },
    enemeyBuff: { defence: 1, attack: 1, speed: 1, specialAttack: 1, specialDefense: 1, accuracy: 1, evasion: 1 }
}


function chooseFromWeightedList(list) {
    //list expects format [{name: string, bias: int}]
    list.sort((a, b) => (a.bias > b.bias) ? -1 : 1);
    let runningBiasTotal = 0
    for (item of list) {
        runningBiasTotal = item.bias + runningBiasTotal
        item.listBias = runningBiasTotal
    }
    let selectedVal = Math.floor(Math.random() * runningBiasTotal)
    for (item of list) {
        if (item.runningBiasTotal < selectedVal) { return item }
    }

}

function randomFromList(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function lookupPokemon(name) {
    let data = fs.readFileSync(`./pokeData/${name}.json`)
    let pokemon = JSON.parse(data);
    return pokemon
}

function accuracyModTable(stage) {
    if (stage < -6) { stage = 6 }
    if (stage > 6) { stage = 6 }
    switch (stage) {

        case -6:
            return .3
        case - 5:
            return .35
        case -4:
            return .45
        case -3:
            return .55
        case -2:
            return .7
        case -1:
            return .85
        case 0:
            return 1
        case 1:
            return 1.15
        case 2:
            return 1.3
        case 3:
            return 1.45
        case 4:
            return 1.55
        case 5:
            return 1.65
        case 6:
            return 1.7
    }
}

function heavySlamTable(attackerWeight, defenderWeight) {
    let comparitiveWeight = defenderWeight * 100 / attackerWeight

    if (comparitiveWeight > 50) {
        return 40
    } else if (comparitiveWeight > 33.5) { return 60 }
    else if (comparitiveWeight > 25) { return 80 }
    else if (comparitiveWeight > 20) { return 100 }
    else { return 120 }

}


function statModTable(stage) {
    switch (stage) {

        case -6:
            return .3
        case - 5:
            return .35
        case -4:
            return .45
        case -3:
            return .55
        case -2:
            return .7
        case -1:
            return .85
        case 0:
            return 1
        case 1:
            return 1.15
        case 2:
            return 1.3
        case 3:
            return 1.45
        case 4:
            return 1.55
        case 5:
            return 1.65
        case 6:
            return 1.7
    }
}

module.exports = {
    randomFromList: (list) => { return randomFromList(list) },
    randomWeighted: (list) => { return this.randomWeighted(list) },
    lookupPokemon: (name) => { return lookupPokemon(name) },
    calculateAccuracy: (stage) => { return accuracyModTable(stage) },
    calculateStatMod: (stage) => { return statModTable(stage) },
    calcHeavySlamPower: (attackerWeight, defenderWeight) => { return heavySlamTable(attackerWeight, defenderWeight) },
    calcSettings: calculationSettings,
    decideValueSettings: decideValueSettings
}