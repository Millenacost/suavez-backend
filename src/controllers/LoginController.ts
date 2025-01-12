import { FastifyReply, FastifyRequest } from "fastify";
import { app } from "../http/server";

class LoginController {
    async handle(req: FastifyRequest, res: FastifyReply){
        const { password, email } = req.body as {password:string, email: string};

        if(!password || !email){
            return res.status(400).send({ message: 'email e senha são obrigatórios!' });
        }

        let client;
        try {
            client = await app.pg.connect()
            const { rows } = await client.query(
              'SELECT * FROM users WHERE email=$1 AND password=$2', [email, password],
            )
            if(rows.length === 0){
                return res.status(404).send({ message: 'Usuário ou senha incorretos!' });
            }
            // Gera um token JWT
            const token = app.jwt.sign({ id: rows[0].id, email: rows[0].email, lastName: rows[0].lastName });
            return res.send({user: rows[0], token})
          } catch (error) {
            if(error instanceof Error) {
            console.error('Erro ao conectar ao banco de dados:', error.message);
            return res.status(500).send({ message: 'Erro ao conectar ao banco de dados.', error: error.message });
            }
          }
          finally {
            if(client){
            client.release()}
          }
    }
}

export { LoginController }