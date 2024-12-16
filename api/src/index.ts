import { Elysia, t } from 'elysia';
// import { html } from '@elysiajs/html';
import { PrismaClient, Prisma } from '@prisma/client';
import { cookie } from '@elysiajs/cookie';
import { jwt } from '@elysiajs/jwt';
import 'dotenv/config';

const db = new PrismaClient();

import { Elysia } from 'elysia';
import { defaultConfig } from './default';

// new Elysia().get('/', () => 'Hello Elysia').listen(3000);
//
// Declare port and host
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

// Create app
const app = new Elysia();

// Add JSON Web Token (JWT)
app.use(
    jwt({
        name: 'MailCraftJWT',
        secret: process.env.JWT_SECRET
    })
);

// Add cookie
app.use(cookie());

interface queryBody {
    userEmail: string;
    model: string;
    promptInstructions: string;
    text: string;
}

app.get('/', () => 'API RUNNING');

app.post('/query', async ({ body: queryBody }) => {
    const user = await db.user.findUnique({
        where: {
            email: body.userEmail
        }
    });
    if (email !== null) {
        if (user.validSubscriber === true) {
            const {
                modelProvider,
                textReponse,
                promptTokens,
                completionTokens,
                totalTokens
            } = await getChatCompletion(
                body.model,
                body.promptInstructions,
                body.text
            );
            const createdQuery = db.query.create({
                data: {
                    userId: body.userEmail,
                    model: body.model,
                    modelProvider: modelProvider,
                    promptTokens: promptTokens,
                    completionTokens: completionTokens,
                    totalTokens: totalTokens
                }
            });
            return { error: false, errorMessage: '', text: textReponse };
        }
        return { error: true, errorMessage: 'No valid subscription', text: '' };
    }
    return { error: true, errorMessage: 'User not found', text: '' };
});

// User creation and authentication
app.post('/signup', async ({ set, body }) => {
    try {
        // create User
        const createdUser = await db.user.create({
            data: {
                email: body.userEmail,
                configs: {
                    create: [defaultConfig]
                }
            }
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                set.status = 409;
                return { error: true, errorMessage: 'User already exists' };
            }
            set.status = 500;
            return {
                error: true,
                errorMessage: `Unknown error. Error code: ${e.code}. Error message: ${e.message}`
            };
        }
        console.log(error);
        set.status = 500;
        return {
            error: true,
            errorMessage: 'Unknown error'
        };
    }
    return { error: false, errorMessage: '' };
});

app.get(
    '/signin/:email',
    async ({ MailCraftJWT, set, cookie, setCookie, params: { email } }) => {
        const user = await db.user.findUnique({
            where: {
                email: email
            }
        });
        if (user !== null) {
            setCookie('auth', await MailCraftJWT.sign(params), {
                httpOnly: true,
                maxage: 7 * 86400
            });
            return `Signed in as ${cookie.auth}`;
        }
        set.status = 401;
        return 'Unknown user';
    }
);
app.get('/auth', async ({ MailCraftJWT, set, cookie: { auth } }) => {
    const profile = await MailCraftJWT.verify(auth);
    if (!profile) {
        set.status = 401;
        return 'Unauthorized';
    }
    return `Hello ${profile.email}`;
});
app.delete(
    '/user/:email',
    async ({ MailCraftJWT, set, cookie: { auth }, params: { email } }) => {
        const profile = await MailCraftJWT.verify(auth);
        if (!profile) {
            set.status = 401;
            return 'Unauthorized';
        }
        console.log(`Trying to delete user ${email}`);
        const deleteUser = await db.user.deleteMany({
            where: {
                email: email
            }
        });
        return `Delete user ${email}`;
    }
);

// Configuration
app.get('/configs', async ({ MailCraftJWT, set, cookie: { auth } }) => {
    const profile = await MailCraftJWT.verify(auth);
    if (!profile) {
        set.status = 401;
        return 'Unauthorized';
    }
    return db.config.findMany({
        where: {
            userId: profile.email
        }
    });
});
app.get(
    '/config/:name',
    async ({ MailCraftJWT, set, cookie: { auth }, params }) => {
        const profile = await MailCraftJWT.verify(auth);
        if (!profile) {
            set.status = 401;
            return 'Unauthorized';
        }
        return db.config.findMany({
            where: {
                userId: profile.email,
                name: params.name
            }
        });
    }
);
app.post('/config', async ({ MailCraftJWT, set, cookie: { auth }, body }) => {
    const profile = await MailCraftJWT.verify(auth);
    if (!profile) {
        set.status = 401;
        return 'Unauthorized';
    }
    const createdConfig = await db.config.create({
        data: {
            userId: profile.email,
            name: body.name,
            promptInstructions: body.promptInstructions,
            actionName: body.actionName ? body.actionName : null
        }
    });
    return createdConfig;
});
app.put(
    '/config/:id',
    async ({ MailCraftJWT, set, cookie: { auth }, params: { id } }) => {
        const profile = await MailCraftJWT.verify(auth);
        if (!profile) {
            set.status = 401;
            return 'Unauthorized';
        }
        return db.config.update({
            where: {
                id: parseInt(id)
            },
            data: body
        });
    }
);
app.listen({ hostname: hostname, port: port });

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
