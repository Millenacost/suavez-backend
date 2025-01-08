import { FastifyReply, FastifyRequest } from "fastify";
import { app } from "../http/server";

class LoginController {
    async handle(req: FastifyRequest, res: FastifyReply){
        const { password, cpf } = req.body as {password:string, cpf: string};

        if(!password || !cpf){
            return res.status(400).send({ message: 'CPF e senha são obrigatórios!' });
        }

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
    }
}

export { LoginController }