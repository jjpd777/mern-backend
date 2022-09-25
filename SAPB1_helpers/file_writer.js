
const fs = require('fs');

module.exports = async function write_file(file_string, file) {
    return fs.writeFile(file_string, file, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        return console.log("JSON file has been saved.");
    })

};