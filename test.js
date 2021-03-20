let danielPerson = {
    name: "daniel",
    age: "old",
    coffees: 0
}


function getCoffee(person) { 

    person.coffees = person.coffees + 1
    console.log(`${person.name} has ${person.coffees} coffees`)
}

for (let i = 0; i < 5; i++) {

    getCoffee(danielPerson);

    if (danielPerson.coffees > 3) { 
        console.log("I'm now awake")
    }
}
 

