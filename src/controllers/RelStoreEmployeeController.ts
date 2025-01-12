import { FastifyRequest, FastifyReply } from "fastify";
import { app } from "../http/server";
import { RelStoreEmployee } from "../models/rel-store-employee.model";

class RelStoreEmployeeController {
    async registerEmployee(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId, userId } = req.body as RelStoreEmployee;

             // Verificar se existe o estabelecimento
             const storeQuery = 'SELECT id FROM store WHERE id = $1';
             const storeResult = await client.query(storeQuery, [storeId]);
             if (storeResult.rows.length === 0) {
                 return res.status(404).send({ message: 'Estabelecimento não encontrado.' });
             }
 
             // Verificar se usuario existe
             const userQuery = 'SELECT id FROM users WHERE id = $1';
             const userResult = await client.query(userQuery, [userId]);
             if (userResult.rows.length === 0) {
                 return res.status(404).send({ message: 'Usuário não encontrado.' });
             }

            const query = `
                INSERT INTO rel_store_employee (storeId, userId)
                VALUES ($1, $2)
                RETURNING *`;

            const values = [storeId, userId];

            const result = await client.query(query, values);
            res.status(201).send({ message: 'Cadastro realizado com sucesso!', assignment: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao realizar cadastro.', error: error.message });
        } finally {
            client.release();
        }
    }

    async removeEmployee(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId, userId } = req.params as { storeId: string, userId: string };

            const query = 'DELETE FROM rel_store_employee WHERE storeId = $1 AND userId = $2 RETURNING *';
            const result = await client.query(query, [storeId, userId]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Funcionário não encontrado no estabelecimento.' });
            }

            res.status(200).send({ message: 'Funcionário removido com sucesso!', assignment: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao remover funcionário.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getEmployeesByStore(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId } = req.params as { storeId: string };

            const query = `
                SELECT users.*
                FROM rel_store_employee
                JOIN users ON rel_store_employee.userId = users.id
                WHERE rel_store_employee.storeId = $1`;
            const result = await client.query(query, [storeId]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Nenhum funcionário encontrado para este estabelecimento.' });
            }

            res.status(200).send(result.rows);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar funcionários.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getStoresByEmployee(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { userId } = req.params as { userId: string };

            const query = `
                SELECT store.*
                FROM rel_store_employee
                JOIN store ON rel_store_employee.storeId = store.id
                WHERE rel_store_employee.userId = $1`;
            const result = await client.query(query, [userId]);

            if (result.rowCount === 0) {
                return res.status(200).send({ rows: result.rows, message: 'Nenhum estabelecimento encontrado para este funcionário.' });
            }

            res.status(200).send({rows: result.rows});
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar estabelecimentos.', error: error.message });
        } finally {
            client.release();
        }
    }

}

export { RelStoreEmployeeController }