const Tools = require('./tools')
const fs = require('fs');
const Move = require('./moveHelper');


const allPokemonList = ["Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot", "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu", "Sandshrew", "Sandslash", "NidoranMale", "NidoranFemale", "Nidorina", "Nidoqueen", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag", "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop", "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool", "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash", "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetchd", "Doduo", "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute", "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "MrMime", "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew"]

const natureTable = [
    { nature: "Adamant", increased: "Attack", decreased: "Special Attack" },
    { nature: "Bashful", increased: "None", decreased: "None" },
    { nature: "Bold", increased: "defence", decreased: "Attack" },
    { nature: "Brave", increased: "Attack", decreased: "Speed" },
    { nature: "Calm", increased: "Special defence", decreased: "Attack" },
    { nature: "Careful", increased: "Special defence", decreased: "Special Attack" },
    { nature: "Docile", increased: "None", decreased: "None" },
    { nature: "Gentle", increased: "Special defence", decreased: "defence" },
    { nature: "Hardy", increased: "None", decreased: "None" },
    { nature: "Hasty", increased: "Speed", decreased: "defence" },
    { nature: "Impish", increased: "defence", decreased: "Special Attack" },
    { nature: "Jolly", increased: "Speed", decreased: "Special Attack" },
    { nature: "Lax", increased: "defence", decreased: "Special defence" },
    { nature: "Lonely", increased: "Attack", decreased: "defence" },
    { nature: "Mild", increased: "Special Attack", decreased: "defence" },
    { nature: "Modest", increased: "Special Attack", decreased: "Attack" },
    { nature: "Naive", increased: "Speed", decreased: "Special defence" },
    { nature: "Naughty", increased: "Attack", decreased: "Special defence" },
    { nature: "Quiet", increased: "Special Attack", decreased: "Speed" },
    { nature: "Quirky", increased: "None", decreased: "None" },
    { nature: "Rash", increased: "Special Attack", decreased: "Special defence" },
    { nature: "Relaxed", increased: "defence", decreased: "Speed" },
    { nature: "Sassy", increased: "Special defence", decreased: "Speed" },
    { nature: "Serious", increased: "None", decreased: "None" },
    { nature: "Timid", increased: "Speed", decreased: "Attack" },
]
const defaultLevel = 50;
const useTM = false;


class Pokemon {
    constructor(name) {
        let pokeData = Tools.lookupPokemon(name)
        this.name = name;
        this.types = pokeData.types;
        this.nature = "Docile";
        this.level = defaultLevel;
        this.moves = Move.randomMoveGen(this.name, this.level, useTM);
        this.pp = Move.getPP(this.moves)
        this.HP = pokeData.stats.HP;
        this.baseSpeed = pokeData.stats.Speed;
        this.baseSpecialDefence = pokeData.stats.SpecialDefence;
        this.baseSpecialAttack = pokeData.stats.SpecialAttack;
        this.baseDefence = pokeData.stats.Defence;
        this.baseAttack = pokeData.stats.Attack;
        this.faint = false
        this.IV = {
            hp: 5,
            speed: 5,
            specialDefence: 5,
            specialAttack: 5,
            defence: 5,
            attack: 5,
        }
        this.EV = {
            hp: 90,
            speed: 90,
            specialDefence: 90,
            specialAttack: 90,
            defence: 90,
            attack: 90,
        }
        this.health = Math.floor(((((2 * this.HP + this.IV.hp + (this.EV.hp / 4)) * this.level) / 100) + this.level + 10));
        this.maxHealth = this.health
        this.speed = calcStat("Speed", this.baseSpeed, this.IV.speed, this.EV.speed, this.level, this.nature)
        this.attack = calcStat("Attack", this.baseAttack, this.IV.attack, this.EV.attack, this.level, this.nature)
        this.specialAttack = calcStat("Special Attack", this.baseSpecialAttack, this.IV.specialAttack, this.EV.specialAttack, this.level, this.nature)
        this.specialDefence = calcStat("Special Defence", this.baseSpecialDefence, this.IV.specialDefence, this.EV.specialDefence, this.level, this.nature)
        this.defence = calcStat("Defence", this.baseDefence, this.IV.defence, this.EV.defence, this.level, this.nature)
        this.speedStage = 0;
        this.defenceStage = 0;
        this.attackStage = 0;
        this.accuracyStage = 0;
        this.evasionStage = 0;
    }
}



function buildTeam() {
    let team = []
    for (let i = 0; i < 6; i++) {

        let pokemonName = Tools.randomFromList(allPokemonList)
        team.push(new Pokemon(pokemonName))
    }
    return team
}





function calcStat(stat, base, iv, ev, level, nature) {
    let natureObj = natureTable.find(n => { return n.nature === nature })
    let natureMulti = 1
    if (natureObj.increased == stat) {
        natureMulti = 1.1
    } else if (natureObj.decreased == stat) {
        natureMulti = .9
    }

    return (Math.floor(((((2 * base + iv + (ev / 4)) * level) / 100) + 5) * natureMulti))
}


function addFavouredMoves(pmon, useTM) {
    let possibleMoves = []
    let pokeData = lookupPokemon(pmon.name);
    for (const [key, value] of Object.entries(pokeData.levelUpMoves)) {
        if (key < pmon.level) {
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


module.exports = {
    buildTeam: () => { return buildTeam() },
    pokeNames: allPokemonList,
    lookupMon: (name) => { return lookupPokemon(name) },
}