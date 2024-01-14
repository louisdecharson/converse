const sqlite3 = require('sqlite3');
const path = require('path');

class Table {
    constructor(database, createQuery, tableName) {
        this.db = database;
        this.createQuery = createQuery;
        this.tableName = tableName;
        this.db.run(this.createQuery, (err) => {
            if (err) {
                console.log(
                    `Error when creating the database ${this.tableName}:`,
                    err.message
                );
            } else {
                console.log(`${this.tableName} table created successfully`);
            }
        });
    }
    insert(...args) {
        const placeholders = Array.from(
            { length: args.length },
            () => '?'
        ).join(', ');
        const insertQuery = $`
        INSERT INTO ${this.tableName} VALUES (${placeholders})`;
        this.db.run(insertQuery, args, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log(
                    `Record inserted successfully into table ${this.tableName}`
                );
            }
        });
    }
    findMany(
        callback,
        filters = {},
        orderBy = false,
        limit = 10,
        ascending = false
    ) {
        // Generate the WHERE clause based on the provided filters
        const whereClause = Object.keys(filters)
            .map((key) => `${key} = ?`)
            .join(' AND ');
        const ascendingClause = ascending ? '' : 'DESC';
        const orderByClause = orderBy
            ? `ORDER BY ${orderBy} ${ascendingClause}`
            : '';
        // SQL command to retrieve records with the specified filters
        const selectQuery = `
        SELECT * FROM ${this.tableName}
        ${whereClause ? `WHERE ${whereClause}` : ''}
        ${orderByClause} LIMIT ${limit};
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

class HistoryTable extends Table {
    constructor(database) {
        const createHistoryTableQuery = `
    CREATE TABLE IF NOT EXISTS HISTORY (
        timestamp DATETIME,
        model TEXT,
        modelProvider TEXT,
        promptInstructions TEXT,
        userContent TEXT,
        response TEXT,
        promptTokens INTEGER,
        completionTokens INTEGER,
        totalTokens INTEGER
    );
`;
        super(database, createHistoryTableQuery, 'HISTORY');
    }
    insert(
        user,
        model,
        modelProvider,
        promptInstructions,
        userContent,
        response,
        promptTokens,
        completionTokens,
        totalTokens
    ) {
        const timestamp = new Date().toISOString();
        super.insert(
            timestamp,
            user,
            model,
            modelProvider,
            promptInstructions,
            userContent,
            response,
            promptTokens,
            completionTokens,
            totalTokens
        );
    }
}
class InstructionsTable extends Table {
    constructor(database) {
        const createInstructionsTableQuery = `
    CREATE TABLE IF NOT EXISTS INSTRUCTIONS (
        createdAt DATETIME,
        name TEXT,
        promptInstructions TEXT,
        actionName TEXT
    );
`;
        super(database, createInstructionsTableQuery, 'INSTRUCTIONS');
    }
    insert(name, promptInstructions, actionName) {
        const timestamp = new Date().toISOString();
        super.insert(timestamp, name, promptInstructions, actionName);
    }
}

module.exports = {
    Table: Table,
    HistoryTable: HistoryTable,
    InstructionsTable: InstructionsTable
};
