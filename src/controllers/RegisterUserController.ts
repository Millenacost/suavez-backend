import { FastifyReply, FastifyRequest } from "fastify";
import { app } from "../http/server";
import { User } from "../models/user.model";

class RegisterUserController {
    async handle(req: FastifyRequest, res: FastifyReply){
        const client = await app.pg.connect()
        try {
            const user: User = req.body as User;
            
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
            // Libera o client após o uso
            client.release();
        }
    }
}

export { RegisterUserController }