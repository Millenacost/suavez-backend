import fastify, { FastifySchema } from 'fastify';
import fastifyJwt from '@fastify/jwt';
// import fastifyBcrypt from 'fastify-bcrypt';
import fastifyPostgres from '@fastify/postgres';
import { routes } from './routes/routes';

export const app = fastify();

// Middleware
app.register(fastifyJwt, { secret: process.env.SECRET_KEY || "my-secret-test" });
// fastify.register(fastifyBcrypt);
app.register(fastifyPostgres, {
    host: process.env.DATABASE_URL,
    database: process.env.DB,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    ssl: {
        rejectUnauthorized: false 
    }
})

app.register(routes)

app.get("/", (req, res) => res.send("Fastify on Vercel"));

// Middleware de autenticação
const authenticateToken = async (request: any, reply:any) => {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.send(err);
    }
};

// Middleware de controle de acesso
// const authorizeRoles = (roles: any) => {
//     return async (request:any, reply: any) => {
//         if (!roles.includes(request.user.role)) {
//             return reply.status(403).send({ message: 'Acesso negado.' });
//         }
//     };
// };

// administradores
// app.get('/admin', { preValidation: [authenticateToken, authorizeRoles(['admin'])] }, async (request: any, reply: any) => {
//     reply.send('Bem-vindo, administrador!');
// });

// funcionários
// app.get('/employee', { preValidation: [authenticateToken, authorizeRoles(['employee', 'admin'])] }, async (request: any, reply: any) => {
//     reply.send('Bem-vindo, funcionário!');
// });

// clientes
// app.get('/client', { preValidation: [authenticateToken, authorizeRoles(['client', 'employee', 'admin'])] }, async (request: any, reply: any) => {
//     reply.send('Bem-vindo, cliente!');
// });

app.listen({port: 3000}, () => {
    console.log('Servidor rodando na porta 3000');
});

export default async function handler(req: any, res: any) {
    await app.ready()
    app.server.emit('request', req, res)
}
