const Damage = require('./damage');
const Decide = require('./decide')
const Remember = require('./dataGatherer')


function turn(pOne, pTwo) {
    let turnOrder = [pOne, pTwo].sort((a, b) => (a.speed > b.speed) ? 1 : -1)

    //TODO: see if there is a more succcint way to handle this
    let attacker = turnOrder[0]
    let defender = turnOrder[1]
    handleGo(attacker, defender);
    if (defender.health < 0) {
        defender.faint = true;
        Remember.rememberKill(attacker.name, attacker.teamNumber)
        Remember.rememberDeath(defender.name, defender.teamNumber)
        return
    } else {
        attacker = turnOrder[1];
        defender = turnOrder[0];
        handleGo(attacker, defender);
        if (defender.health < 0) {
            Remember.rememberKill(attacker.name, attacker.teamNumber)
            Remember.rememberDeath(defender.name, defender.teamNumber)
            defender.faint = true
            return
        }
    }
}
function handleGo(attacker, defender) {
    let chosenMove = decideMove(attacker, defender)
    if (chosenMove > -1) {
        let canMove = checkAndProcessStatus(attacker, defender)
        if (canMove) {
            let result = Damage.calculateDamage(attacker, defender, chosenMove, false)
            defender.health = defender.health - result.damage
        }
    }
}

function decideMove(attacker, defender) {
    let chosenMove = -1
    if (attacker.teamNumber == 1) {
        chosenMove = Decide.move(attacker, defender);
    }
    else { 
        chosenMove = Math.floor(Math.random() * attacker.moves.length)
    }
    //cacluate damage doesnt use weather Favour yet
    attacker.pp[chosenMove]--
    return chosenMove
}





function checkAndProcessStatus(attacker, defender) {
    let doesMove = true
    if (attacker.status === "Confusion") {
        if (Math.random() < 0.5) {
            chosenMove = -1
            let confusonDamage = (((((2 * attacker.level) / 5) + 2) * 40 * attacker.attack / attacker.defence) / 50) + 2
            attacker.health = attacker.health - confusonDamage
            doesMove = false
        }
    }
    if (attacker.status === "Paralysis") {
        if (Math.random() < 0.5) {
            doesMove = false
        }
    }
    //take damage if burned
    if (attacker.status === "Burn" || attacker.status === "Poison") {
        attacker.health = attacker.health - attacker.health / 8
    }
    return doesMove
}


module.exports = {
    turn: (monOne, monTwo) => { return turn(monOne, monTwo) }
}