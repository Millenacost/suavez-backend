import { FastifyReply, FastifyRequest } from "fastify";
import { app } from "../http/server";
import { User } from "../models/user.model";

class UserController {
    async register(req: FastifyRequest, res: FastifyReply){
        const client = await app.pg.connect()
        try {
            const user: User = req.body as User;

            // Verificando se o usuário já existe (por CPF ou email)
            const checkUserExists = 'SELECT * FROM users WHERE cpf=$1 OR email=$2';
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

    async delete(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { userId } = req.params as { userId: string };

            if (!userId) {
                return res.status(400).send({ message: 'ID do usuário não informado.' });
            }

            const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
            const result = await client.query(query, [userId]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Usuário não encontrado.' });
            }

            res.status(200).send({ message: 'Usuário deletado com sucesso!', user: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao deletar usuário.', error: error.message });
        } finally {
            client.release();
        }
    }

    async update(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const user: User = req.body as User;

            const fields: string[] = [];
            const values: any[] = [];
            let index = 0;

            if (user.name !== null && user.name !== undefined) {
                fields.push(`name = $${index++}`);
                values.push(user.name);
            }
            if (user.lastName !== null && user.lastName !== undefined) {
                fields.push(`lastName = $${index++}`);
                values.push(user.lastName);
            }
            if (user.cpf !== null && user.cpf !== undefined) {
                fields.push(`cpf = $${index++}`);
                values.push(user.cpf);
            }
            if (user.email !== null && user.email !== undefined) {
                fields.push(`email = $${index++}`);
                values.push(user.email);
            }
            if (user.password !== null && user.password !== undefined) {
                fields.push(`password = $${index++}`);
                values.push(user.password);
            }
            if (user.phone !== null && user.phone !== undefined) {
                fields.push(`phone = $${index++}`);
                values.push(user.phone);
            }
            if (user.street !== null && user.street !== undefined) {
                fields.push(`street = $${index++}`);
                values.push(user.street);
            }
            if (user.number !== null && user.number !== undefined) {
                fields.push(`number = $${index++}`);
                values.push(user.number);
            }
            if (user.city !== null && user.city !== undefined) {
                fields.push(`city = $${index++}`);
                values.push(user.city);
            }
            if (user.state !== null && user.state !== undefined) {
                fields.push(`state = $${index++}`);
                values.push(user.state);
            }

            if (fields.length === 0) {
                return res.status(400).send({ message: 'Nenhum campo para atualizar.' });
            }

            values.push(user.id);
            const updateQuery = `
                UPDATE users
                SET ${fields.join(', ')}
                WHERE id = $${index++}
                RETURNING *`;

            const result = await client.query(updateQuery, values);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Usuário não encontrado.' });
            }

            res.status(200).send({ message: 'Usuário atualizado com sucesso!', user: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao atualizar usuário.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getByCpf(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { cpf } = req.params as { cpf: string };

            if(!cpf) {
                return res.status(400).send({ message: 'CPF não informado.' });
            }

            const query = 'SELECT * FROM users WHERE cpf = $1';
            const result = await client.query(query, [cpf]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Usuário não encontrado.' });
            }

            res.status(200).send(result.rows[0]);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar usuário.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getByName(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { name } = req.params as { name: string };

            if(!name) {
                return res.status(400).send({ message: 'Nome não informado.' });
            }

            const query = 'SELECT * FROM users WHERE name = $1';
            const result = await client.query(query, [name]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Usuário não encontrado.' });
            }

            res.status(200).send(result.rows);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar usuário.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getByEmail(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { email } = req.params as { email: string };

            if(email === undefined || email === null) {
                return res.status(400).send({ message: 'Email não informado.' });
            }

            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await client.query(query, [email]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Usuário não encontrado.' });
            }

            res.status(200).send(result.rows[0]);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar usuário.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getById(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { userId } = req.params as { userId: string };

            if(!userId) {
                return res.status(400).send({ message: 'ID do usuário não informado.' });
            }

            const query = 'SELECT * FROM users WHERE id = $1';
            const result = await client.query(query, [userId]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Usuário não encontrado.' });
            }

            res.status(200).send(result.rows[0]);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar usuário.', error: error.message });
        } finally {
            client.release();
        }
    }


}

export { UserController }