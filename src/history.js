const sqlite3 = require('sqlite3');
const path = require('path');

class HistoryDB {
    constructor(appDataPath) {
        this.dbPath = path.join(appDataPath, 'history.db');
        this.db = new sqlite3.Database(this.dbPath);
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
        this.db.run(createHistoryTableQuery, (err) => {
            if (err) {
                console.log('Error when creating the database: ', err.message);
            } else {
                console.log('HISTORY table created successfully');
            }
        });
    }
    insert(model, modelProvider, promptInstructions, userContent, response) {
        const timestamp = new Date().toISOString();
        const insertQuery = `
        INSERT INTO HISTORY (timestamp, model, model_provider, prompt_instructions, user_content, response)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
        this.db.run(
            insertQuery,
            [
                timestamp,
                model,
                modelProvider,
                promptInstructions,
                userContent,
                response
            ],
            (err) => {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log('Record inserted successfully');
                }
            }
        );
    }
    findMany(callback, filters = {}, limit = 10) {
        // Generate the WHERE clause based on the provided filters
        const whereClause = Object.keys(filters)
            .map((key) => `${key} = ?`)
            .join(' AND ');

        // SQL command to retrieve records with the specified filters
        const selectQuery = `
        SELECT * FROM HISTORY
        ${whereClause ? `WHERE ${whereClause}` : ''}
        ORDER BY timestamp DESC LIMIT ${limit};
    `;

        // Execute the select query with the provided filter values
        this.db.all(selectQuery, Object.values(filters), (err, rows) => {
            if (err) {
                console.error(err.message);
                callback(err, null);
            } else {
                // Return the result to the callback function
                callback(null, rows);
            }
        });
    }
}

module.exports = {
    HistoryDB: HistoryDB
};
