const fs = require('fs');

function readData() {
    const data = fs.readFileSync('db.json');
    return JSON.parse(data);
}

module.exports = {
    readData
};