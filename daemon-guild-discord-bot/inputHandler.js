const readline = require('readline');

module.exports = {
    rl : readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }),
    commands : {
        test: () => {console.log(`tested.`)},
        test2: () => {console.log(`2tested.`)}
    },
    processor () {
        this.rl.question('', input => {
        
            if(this.commands[input]) 
            {
                this.commands[input]();
            }
            else 
            {
                console.log(`${input} was not found.`)
            }
            
            this.processor();
        });
    },
    init() {
        this.processor();
    }
}