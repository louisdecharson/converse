const sqlite3 = require('sqlite3');
const path = require('path');
const { Table: Database } = require('./db.js');

class InstructionsDB extends Database {
    constructor(appDataPath) {
        const createInstructionsTableQuery = `
    CREATE TABLE IF NOT EXISTS INSTRUCTIONS (
        dateCreated DATETIME
        name TEXT,
        prompt_instructions TEXT,
        actionName TEXT,
        description TEXT
    );
`;
        super(
            appDataPath,
            'instructions.db',
            createInstructionsTableQuery,
            'USER_CONFIG'
        );
    }
    insert(name, promptInstructions, actionName, description) {
        const timestamp = new Date().toISOString();
        super.insert(
            timestamp,
            name,
            promptInstructions,
            actionName,
            description
        );
    }
}
module.exports = {
    ConfigurationDB: InstructionsDB
};
