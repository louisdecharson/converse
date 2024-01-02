const sqlite3 = require('sqlite3');
const path = require('path');
const { Table: Table } = require('./db');

class HistoryTable extends Table {
    constructor(database) {
        const createHistoryTableQuery = `
    CREATE TABLE IF NOT EXISTS HISTORY (
        timestamp DATETIME,
        model TEXT,
        model_provider TEXT,
        prompt_instructions TEXT,
        user_content TEXT,
        response TEXT
    );
`;
        super(database, createHistoryTableQuery, 'HISTORY');
    }
    insert(model, modelProvider, promptInstructions, userContent, response) {
        const timestamp = new Date().toISOString();
        super.insert(
            timestamp,
            model,
            modelProvider,
            promptInstructions,
            userContent,
            response
        );
    }
}
module.exports = {
    HistoryTable: HistoryTable
};
