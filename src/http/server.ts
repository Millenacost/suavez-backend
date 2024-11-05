import fastify, { FastifySchema } from 'fastify';
import fastifyJwt from '@fastify/jwt';
// import fastifyBcrypt from 'fastify-bcrypt';
import fastifyPostgres from '@fastify/postgres';
import { User } from '../models/user.model';

export const app = fastify();

const SECRET_KEY = 'my_secret_key';

const userSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['name', 'cpf', 'email', 'password'], // Campos obrigatórios
        properties: {
            name: { type: 'string' },
            lastName: { type: 'string' },
            cpf: { type: 'string' },
            email: { type: 'string', format: 'email' }, // Formato de e-mail
            password: { type: 'string', minLength: 6 }, // Senha com pelo menos 6 caracteres
            phone: { type: 'string', nullable: true },
            street: { type: 'string', nullable: true },
            number: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            state: { type: 'string', nullable: true },
        },
        additionalProperties: false, // Não permite propriedades adicionais
    },
};

// Middleware
app.register(fastifyJwt, { secret: SECRET_KEY });
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

app.get("/", (req, res) => res.send("Fastify on Vercel"));

app.post('/login', async (req:any, res:any) => {
    const { password, cpf } = req.body;
    const client = await app.pg.connect()
    try {
        const { rows } = await client.query(
          'SELECT * FROM users WHERE cpf=$1 AND password=$2', [cpf, password],
        )
        if(rows.length === 0){
            return res.status(404).send({ message: 'Usuário ou senha incorretos!' });
        }
        // Gera um token JWT
        const token = app.jwt.sign({ id: rows[0].id, cpf: rows[0].cpf, lastName: rows[0].lastName });
        return res.send({user: rows[0], token})
      } finally {
        client.release()
      }

});

app.post('/register', { schema:userSchema },async (req: any, res: any) => {
    const client = await app.pg.connect()
    try {
        const user: User = req.body;
        
        // Verificando se o usuário já existe (por CPF ou email)
        const checkUserExists = 'SELECT * FROM users WHERE cpf = $1 OR email = $2';
        const checkResult = await client.query(checkUserExists, [user.cpf, user.email]);

        if (checkResult.rows.length > 0) {
            return res.status(409).send({ message: 'Usuário já cadastrado com este CPF ou email.' });
        }

        const query = `
            INSERT INTO users (name, lastName, cpf, email, password, phone, street, number, city, state)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

        const values = [user.name, user.lastName, user.cpf, user.email, user.password, user.phone, user.street, user.number, user.city, user.state]    

        const result = await client.query(query, values);
        res.status(201).send({ message: 'Usuário cadastrado com sucesso!', user: result.rows[0] });
    } catch (error: any) {
        res.status(500).send({ message: 'Erro ao cadastrar o usuário.', error: error.message });
    } finally {
        // Libera o cliente após o uso
        client.release();
    }
});

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

// app.listen({port:8080}, (err,address) => {
//     if(err) {
//         console.log(err)
//     }
//     console.log("Server rodando na porta 8080")
// })

export default app;
