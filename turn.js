const Damage = require('./damage');



function turn(pOne, pTwo) {
    let turnOrder = [pOne, pTwo].sort((a, b) => (a.speed > b.speed) ? 1 : -1)

    //TODO: see if there is a more succcint way to handle this
    let attacker = turnOrder[0]
    let defender = turnOrder[1]
    handleGo(attacker, defender);
    if (defender.health < 0) {
        defender.faint = true;
        // console.log(`${defender.name} fainted`);
        return
    } else {
        attacker = turnOrder[1];
        defender = turnOrder[0];
        handleGo(attacker, defender);
        if (defender.health < 0) {
            defender.faint = true
            // console.log(`${defender.name} fainted`)
            return
        }
    }
}

function handleGo(attacker, defender) {
    chosenMove = Math.floor(Math.random() * attacker.moves.length)
    //cacluate damage doesnt use weather Favour yet
    if (attacker.pp[chosenMove] < 1) {
        let canMove = false
        for (move of attacker.pp) {
            if (move > 0) {
                canMove = true
            }
        }
        if (canMove == false) {
            return
        } else { 
            handleGo(attacker, defender)
            return
        }
    }
    attacker.pp[chosenMove]--
    if (attacker.status == "Confusion") {
        if (Math.random() < 0.5) {
            chosenMove = -1
            let confusonDamage = (((((2 * attacker.level) / 5) + 2) * 40 * attacker.attack / attacker.defence) / 50) + 2
            attacker.health = attacker.health - confusonDamage
        }
    }
    let result = Damage.calculateDamage(attacker, defender, chosenMove, false)



    defender.health = defender.health - result.damage

    //take damage if burned
    if (attacker.status === "Burn" || attacker.status === "Poison") {
        attacker.health = attacker.health - attacker.health / 8
    }
}


module.exports = {
    turn: (monOne, monTwo) => { return turn(monOne, monTwo) }
}