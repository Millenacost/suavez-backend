import fastify, { FastifySchema } from "fastify";
import fastifyJwt from "@fastify/jwt";
// import fastifyBcrypt from 'fastify-bcrypt';
import fastifyPostgres from "@fastify/postgres";
import cors from "@fastify/cors";
import routes from "./routes/routes";
import dotenv from "dotenv";
import multipart from '@fastify/multipart'


dotenv.config();
export const app = fastify();

// Middleware
app.register(fastifyJwt, {
	secret: process.env.SECRET_KEY || "my-secret-test",
});

// CORS
app.register(cors, { origin: "*", credentials: true });

app.register(multipart);

app.register(routes, { prefix: "/api" });

app.register(routes);

// fastify.register(fastifyBcrypt);

//rodar no vercel
app.register(fastifyPostgres, {
	host: process.env.DATABASE_URL,
	database: process.env.DB,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	ssl: {
		rejectUnauthorized: false,
	},
});

// rodar localmente
// app.register(fastifyPostgres, {
//     connectionString: process.env.CONNECTION_STRING,
//     ssl: {
//         rejectUnauthorized: false
//     }
// })

// app.get("/", async (req: any, res: any) => {
// 	console.log("Rota raiz acessada");
// 	return res.send("Fastify on Vercel");
// });


// Middleware de autenticação
const authenticateToken = async (request: any, reply: any) => {
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

app.listen({ port: 3000 }, () => {
	console.log("Servidor rodando na porta 3000");
});

export default async function handler(req: any, res: any) {
	await app.ready();
	app.server.emit("request", req, res);
}
