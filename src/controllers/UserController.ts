import { FastifyReply, FastifyRequest } from "fastify";
import { app } from "../http/server";
import { User } from "../models/user.model";
import { put } from "@vercel/blob";
import { profile } from "console";

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
                INSERT INTO users (name, lastName, cpf, email, password, phone, address, number, city, stateId, ddd)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
            

    
            const values = [user.name, user.lastName, user.cpf, user.email, user.password, user.phone, user.address, user.number, user.city, user.stateId, user.ddd];    
    
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
            const parts = req.parts ? req.parts() : undefined;

            let user: any;
            let profileImage: any;
            let removeProfileImage = false;

            if (parts) {
                for await (const part of parts) {
                    if (part.type === 'field') {
                        if (part.fieldname === 'user') {
                            try {
                                user = JSON.parse(part.value as string);
                            } catch {
                                return res.status(400).send({ error: 'Campo "user" mal formatado.' });
                            }
                        }

                        if (part.fieldname === 'profileImage') {
                            profileImage = part.value;
                        }

                        if (part.fieldname === 'removeProfileImage') {
                            removeProfileImage = part.value === 'true';
                        }
                    }
                }
            }


            const fields: string[] = [];
            const values: any[] = [];
            let index = 1;

            if (!user) {
                return res.status(400).send({ message: 'Campo "user" obrigatório.', valid: false });
            }

            if (profileImage) {
                user.profileImage = profileImage;
            }

            if(removeProfileImage) {
                // TODO - Remover a imagem
            }

            index = this.userInputs(user, fields, index, values);

            if (fields.length === 0) {
                return res.status(400).send({ message: 'Nenhum campo para atualizar.', valid: false });
            }

            values.push(user.id);
            const updateQuery = `
                            UPDATE users
                            SET ${fields.join(', ')}
                            WHERE id = $${index++}
                            RETURNING *`;

            const result = await client.query(updateQuery, values);

            if (result.rowCount === 0) {
                return res.status(404).send({ valid: false, message: 'Usuário não encontrado.' });
            }

            res.status(200).send({ message: 'Usuário atualizado com sucesso!', data: result.rows[0], valid: true });


        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao atualizar usuário.', valid: false });
        } finally {
            client.release();
        }
    }

    private userInputs(user: User, fields: string[], index: number, values: any[]) {
        if (user.name !== null && user.name !== undefined) {
            fields.push(`name = $${index++}`);
            values.push(user.name);
        }
        if (user.lastName !== null && user.lastName !== undefined) {
            fields.push(`"lastName" = $${index++}`);
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
        if (user.password !== null && user.password !== undefined && user.password.trim() !== '') {
            fields.push(`password = $${index++}`);
            values.push(user.password);
        }
        if (user.phone !== null && user.phone !== undefined) {
            fields.push(`phone = $${index++}`);
            values.push(user.phone);
        }
        if (user.address !== null && user.address !== undefined) {
            fields.push(`address = $${index++}`);
            values.push(user.address);
        }
        if (user.number !== null && user.number !== undefined) {
            fields.push(`number = $${index++}`);
            values.push(user.number);
        }
        if (user.city !== null && user.city !== undefined) {
            fields.push(`city = $${index++}`);
            values.push(user.city);
        }
        if (user.stateId !== null && user.stateId !== undefined) {
            fields.push(`"stateId" = $${index++}`);
            values.push(user.stateId);
        }
        if (user.ddd !== null && user.ddd !== undefined) {
            fields.push(`ddd = $${index++}`);
            values.push(user.ddd);
        }

        if (user.acceptAwaysMinorQueue !== null && user.acceptAwaysMinorQueue !== undefined) {
            fields.push(`"acceptAwaysMinorQueue" = $${index++}`);
            values.push(user.acceptAwaysMinorQueue);
        }
        if(user.profileImage !== null && user.profileImage !== undefined) {
            fields.push(`"profileImage" = $${index++}`);  
            values.push(user.profileImage);
        }
        return index;
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