const sqlite3 = require('sqlite3');
const path = require('path');

class Table {
    constructor(database, tableName, createQuery = null) {
        this.db = database;
        this.tableName = tableName;
        if (createQuery) {
            this.createTable(createQuery);
        }
    }
    createTable(createQuery) {
        return new Promise((resolve, reject) => {
            this.db.run(createQuery, (err) => {
                if (err) {
                    console.error(
                        `Error when creating the database ${this.tableName}:`,
                        err.message
                    );
                    reject(err);
                } else {
                    console.log(`${this.tableName} table created successfully`);
                    resolve();
                }
            });
        });
    }
    tableExists() {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT name FROM sqlite_master WHERE type='table' AND name=?;`;
            this.db.get(query, [this.tableName], (err, row) => {
                if (err) {
                    console.error(
                        `Error when checking if table ${this.tableName} exists:`,
                        err.message
                    );
                    reject(err);
                } else {
                    // Returns true if the table exists, false otherwise
                    resolve(!!row);
                }
            });
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
    getAll(callback, orderBy = false, ascending = false) {
        const ascendingClause = ascending ? '' : 'DESC';
        const orderByClause = orderBy
            ? `ORDER BY ${orderBy} ${ascendingClause}`
            : '';
        const selectQuery = `SELECT ROWID, * FROM ${this.tableName} ${orderByClause};`;
        this.db.all(selectQuery, (err, rows) => {
            if (err) {
                console.error(err.message);
                callback(err, null);
            } else {
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
        super(database, 'HISTORY', createHistoryTableQuery);
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
    getEnrichedHistory(callback, tasksTable) {
        const query = `
        SELECT rowid, *
        FROM (
        SELECT rowid, *,
        ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY timestamp DESC) as rn
        FROM ${this.tableName}
        ) AS subquery
        WHERE rn = 1 ORDER BY timestamp DESC;
        `;
        // Get all chat history records merge with task name
        tasksTable.getAll((err, tasks) => {
            if (err) {
                callback(err, null);
            } else {
                this.db.all(query, (err, fullHistory) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        const historyWithTaskName = fullHistory.map((chat) => {
                            const task = tasks.find(
                                (task) => task.rowid === chat.task_id
                            );
                            if (!task) {
                                return {
                                    ...chat,
                                    task_name: 'Unknown Task'
                                };
                            }
                            return { ...chat, task_name: task.name };
                        });
                        callback(null, historyWithTaskName);
                    }
                });
            }
        });
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
        super(database, 'TASKS');
        this.defaultTasks = [
            {
                name: 'Chat',
                promptInstructions:
                    'You are a helpful LLM model. Please respond as concisely as possible.',
                description: 'Chat with LLM models to get help with any topic.',
                actionName: 'Chat',
                chatMode: 1,
                defaultProvider: 'openai'
            },
            {
                name: 'Rephrase',
                promptInstructions:
                    'You are a helpful assistant that rephrase idiomatically to help non-native English speakers to communication. Minimise the number of changes you make to the initial text. Initial email will be sent to you and you just need to send back the improved text. Do not include anything before or after the re-drafted text. Never include things like "Hello, I am an assistant ...,  do not include additional context about the fact that you are an assistant, etc',
                description: 'Rephrase text in idiomatic English',
                actionName: 'Improve',
                chatMode: 0,
                defaultProvider: 'openai'
            }
        ];
        // Check if table exists and add default tasks if it's new
        this.tableExists().then((exists) => {
            if (!exists) {
                this.createTable(createInstructionsTableQuery).then(() => {
                    console.log('TasksTable is new, adding default tasks...');
                    this.addDefaultTasks();
                });
            }
        });
    }
    insert(
        name,
        promptInstructions,
        description,
        actionName,
        chatMode,
        defaultProvider = 'openai',
        defaultModel = 'default'
    ) {
        const timestamp = new Date().toISOString();
        return super.insert(
            timestamp,
            name,
            promptInstructions,
            actionName,
            description,
            defaultProvider,
            defaultModel,
            chatMode,
            '#6c5ce7',
            '',
            'user',
            timestamp,
            0
        );
    }
    async addDefaultTasks() {
        for (const task of this.defaultTasks) {
            try {
                await this.insert(
                    task.name,
                    task.promptInstructions,
                    task.description,
                    task.actionName,
                    task.chatMode,
                    task.defaultProvider
                );
                console.log(`Added default task: ${task.name}`);
            } catch (error) {
                console.error(`Error adding default task ${task.name}:`, error);
            }
        }
    }
}

module.exports = {
    Table: Table,
    HistoryTable: HistoryTable,
    TasksTable: TasksTable
};
