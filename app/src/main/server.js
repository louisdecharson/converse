const path = require('node:path');
const express = require('express');
const hbs = require('hbs');

const startServer = (tasksTable, callback) => {
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    const staticFilesDir = path.join(__dirname, '../../public');
    app.use(express.static(staticFilesDir));
    app.use(express.json());

    const partialsDir = path.join(__dirname, '../renderer/views/partials');
    const viewsDir = path.join(__dirname, '../renderer/views');
    app.set('view engine', 'hbs');
    app.set('views', viewsDir);
    hbs.registerPartials(partialsDir);

    // Routes
    app.get('/', (req, res) => {
        tasksTable.findMany(
            (err, rows) => {
                if (err) {
                    console.log(err);
                    return res
                        .status(500)
                        .send('Error occurred while fetching tasks');
                }
                res.render('main', { tasks: rows });
            },
            {},
            'pinned DESC, name',
            100,
            true
        );
    });
    app.get('/create_task', (req, res) => {
        res.render('create_task', {
            action: 'Create',
            title: 'Create new task'
        });
    });
    app.post('/create_task', (req, res) => {
        const {
            name,
            prompt_instructions,
            description,
            action_name,
            chat_mode,
            default_provider,
            default_model
        } = req.body;
        tasksTable
            .insert(
                name,
                prompt_instructions,
                description,
                action_name,
                chat_mode,
                default_provider,
                default_model
            )
            .then((rowId) =>
                res.status(200).send(`Record inserted with rowid ${rowId}`)
            )
            .catch((error) => {
                res.status(500).send('Error when creating task');
            });
    });
    app.get('/edit_task', (req, res) => {
        tasksTable.findMany(
            (err, task) => {
                if (err) {
                    console.log(err);
                    return res
                        .status(500)
                        .send('Error occured while fetching task');
                }
                res.render('create_task', {
                    task: task[0],
                    action: 'Update',
                    title: 'Update task'
                });
            },
            { rowid: req.query.taskid }
        );
    });
    app.post('/edit_task', (req, res) => {
        const {
            name,
            prompt_instructions,
            description,
            action_name,
            chat_mode,
            default_provider,
            default_model
        } = req.body;
        const taskId = req.query.taskid;
        try {
            tasksTable.update(taskId, {
                name: name,
                prompt_instructions: prompt_instructions,
                description: description,
                action_name: action_name,
                chat_mode: chat_mode,
                default_provider: default_provider,
                default_model: default_model
            });
            res.status(200).send('record updated');
        } catch (error) {
            res.status(500).send('Error when updating task');
        }
    });
    app.get('/task/:rowid', (req, res) => {
        tasksTable.findMany(
            (err, tasks) => {
                if (err) {
                    console.log(err);
                    return res
                        .status(500)
                        .send('Error occured while fetching task');
                }
                const task = tasks[0];
                res.render('task', { task: task });
            },
            { rowid: req.params.rowid }
        );
    });
    app.get('/settings', (req, res) => res.render('settings'));
    app.get('/models', (req, res) => res.render('models'));
    app.delete('/task/:rowid', (req, res) => {
        tasksTable.delete(req.params.rowid, (err) => {
            if (err) {
                return res
                    .status(500)
                    .send('Error occurred when deleting task');
            } else {
                return res.status(200).send('Task deleted');
            }
        });
    });
    const server = app.listen(0, () => {
        const { port } = server.address();
        console.log(`Express server running on ${port}`);
        callback(port);
    });
};
module.exports = startServer;
