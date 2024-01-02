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
        SELECT * FROM ${this.databaseName}
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

const db = new sqlite3.Database('./test.sqlite');

const table1 = new Table(
    db,
    'CREATE TABLE IF NOT EXISTS TABLE_1 (name TEXT);',
    'table_1'
);
const table2 = new Table(
    db,
    'CREATE TABLE IF NOT EXISTS TABLE_2 (name TEXT);',
    'table_2'
);
