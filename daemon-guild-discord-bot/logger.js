const fs = require('fs');

module.exports = {
    config: null,
    
    Init(config){
        this.config = config;        
    },
    Log(status, type, document, directory, filename){
        LogToFile(status, type, document, directory, filename);
    }
}

function LogToFile(status, type, document, directory, filename = log.txt) {
    let currentTime = new Date();
    currentTime.toDateString();
    let log = `${currentTime} ${status} ${type} ${document}\n`;

    directory = `./logs/${directory}`
    
    let lastchar = directory.slice(-1);
    if (lastchar !== "/") {
        directory = directory + "/";
    }

    // Check if folder exists, if not -> create it.
    if(!fs.existsSync(directory)){
        fs.mkdirSync(directory, { recursive: true });
    };

    // File full path E.G.: /logs/database/log.txt
    fullpath = directory + filename;

    // Log valid message.
    fs.appendFile(fullpath, log, function (err) {
        if (err) {
            // FileSystem error when logging.
            console.log("LogToFile error when trying to log below:");
            console.log(`Path: ${fullpath}`)
            console.log(`Log: ${log}`)            
            LogToFile("error", "LogToFile", err, "", "logging.txt");
        } else {
            // FileSystem success when logging.
            // console.log("Path: " + fullpath + " - Log: " + log);
        }
    });
}
