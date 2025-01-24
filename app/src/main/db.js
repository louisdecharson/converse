const sqlite3 = require('sqlite3');
const path = require('path');

class Table {
    constructor(database, createQuery, tableName) {
        this.db = database;
        this.createQuery = createQuery;
        this.tableName = tableName;
        this.db.run(this.createQuery, (err) => {
            if (err) {
                console.error(
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
        const insertQuery = `
        INSERT INTO ${this.tableName} VALUES (${placeholders})`;
        return new Promise((resolve, reject) => {
            const tableName = this.tableName;
            this.db.run(insertQuery, args, function (err) {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    console.log(
                        `Record inserted successfully into table ${tableName} (rowid: ${this.lastID})`
                    );
                    resolve(this.lastID);
                }
            });
        });
    }
    update(rowId, updates) {
        const setPlaceholders = [];
        const values = [];
        for (const [column, value] of Object.entries(updates)) {
            setPlaceholders.push(`${column} = ?`);
            values.push(value);
        }
        const setClause = setPlaceholders.join(', ');
        const updateQuery = `
        UPDATE ${this.tableName} SET ${setClause} WHERE rowid = ?`;
        values.push(rowId);
        this.db.run(updateQuery, values, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log(
                    `Record updated successfully in table ${this.tableName} (rowid: ${rowId})`
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
        SELECT ROWID, * FROM ${this.tableName}
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
    delete(rowId, callback) {
        const deleteQuery = `DELETE FROM ${this.tableName} WHERE rowid = ?`;
        this.db.run(deleteQuery, [rowId], (err) => {
            if (err) {
                console.log(
                    'Error running query: ',
                    deleteQuery,
                    '. Error message: ',
                    err.message
                );
                callback(err);
            } else {
                console.log(
                    'DELETE Query successful (query: ',
                    deleteQuery,
                    ', rowid=',
                    rowId,
                    ')'
                );
                callback(null);
            }
        });
    }
}

class HistoryTable extends Table {
    constructor(database) {
        const createHistoryTableQuery = `
        CREATE TABLE IF NOT EXISTS HISTORY (
        timestamp DATETIME,
        user TEXT,
        model TEXT,
        model_provider TEXT,
        prompt_instructions TEXT,
        user_content TEXT,
        response TEXT,
        prompt_tokens INTEGER,
        completion_tokens INTEGER,
        total_tokens INTEGER,
        task_id INTEGER,
        chat_id INTEGER
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
        totalTokens,
        task_id,
        chat_id
    ) {
        const timestamp = new Date().toISOString();
        return super.insert(
            timestamp,
            user,
            model,
            modelProvider,
            promptInstructions,
            userContent,
            response,
            promptTokens,
            completionTokens,
            totalTokens,
            task_id,
            chat_id
        );
    }
}
class TasksTable extends Table {
    constructor(database) {
        const createInstructionsTableQuery = `
        CREATE TABLE IF NOT EXISTS TASKS (
        date_created DATETIME,
        name TEXT,
        prompt_instructions TEXT,
        action_name TEXT,
        description TEXT,
        default_provider TEXT DEFAULT openai,
        default_model TEXT,
        chat_mode INTEGER DEFAULT 0,
        color TEXT,
        icon TEXT,
        user TEXT,
        date_modified DATETIME,
        pinned INTEGER
        );
`;
        super(database, createInstructionsTableQuery, 'TASKS');
    }
    insert(name, promptInstructions, description, actionName, chatMode) {
        const timestamp = new Date().toISOString();
        return super.insert(
            timestamp,
            name,
            promptInstructions,
            actionName,
            description,
            'openai',
            'default',
            chatMode,
            '#6c5ce7',
            '',
            'user',
            timestamp,
            0
        );
    }
}

module.exports = {
    Table: Table,
    HistoryTable: HistoryTable,
    TasksTable: TasksTable
};
