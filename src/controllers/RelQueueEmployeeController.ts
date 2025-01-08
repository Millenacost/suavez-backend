import { FastifyRequest, FastifyReply } from "fastify";
import { app } from "../http/server";
import { RelQueueEmployee } from "../models/rel-queue-employee.model";

class RelQueueEmployeeController {
    async registerEmployee(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { queueId, userId } = req.body as RelQueueEmployee;

             // Verificar se queueId existe na tabela queue
             const queueQuery = 'SELECT id FROM queue WHERE id = $1';
             const queueResult = await client.query(queueQuery, [queueId]);
             if (queueResult.rows.length === 0) {
                 return res.status(404).send({ message: 'Fila não encontrada.' });
             }
 
             // Verificar se userId existe na tabela users
             const userQuery = 'SELECT id FROM users WHERE id = $1';
             const userResult = await client.query(userQuery, [userId]);
             if (userResult.rows.length === 0) {
                 return res.status(404).send({ message: 'Usuário não encontrado.' });
             }

            const query = `
                INSERT INTO rel_queue_employee (queueId, userId)
                VALUES ($1, $2)
                RETURNING *`;

            const values = [queueId, userId];

            const result = await client.query(query, values);
            res.status(201).send({ message: 'Cadastro realizado com sucesso!', assignment: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao realizar cadastro.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getEmployeesInQueue(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { queueId } = req.params as { queueId: string };

            if(!queueId) {
                return res.status(400).send({ message: 'Fila não foi informada.' });
            }

            // Verificar se queueId existe na tabela queue
            const queueQuery = 'SELECT id FROM queue WHERE id = $1';
            const queueResult = await client.query(queueQuery, [queueId]);
            if (queueResult.rows.length === 0) {
                return res.status(404).send({ message: 'Fila não encontrada.' });
            }

            // Buscar todos os funcionários na fila
            const query = `
                SELECT users.*
                FROM rel_queue_employee
                JOIN users ON rel_queue_employee.userId = users.id
                WHERE rel_queue_employee.queueId = $1`;
            const result = await client.query(query, [queueId]);

            res.status(200).send(result.rows);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar funcionários na fila.', error: error.message });
        } finally {
            client.release();
        }
    }

    async removeEmployeeFromQueue(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { queueId, userId } = req.body as { queueId: number, userId: number };

            if(!queueId || !userId) {
                return res.status(400).send({ message: 'Fila ou funcionário não foi informado.' });
            }

            // Verificar se a relação existe na tabela rel_queue_employee
            const relQuery = 'SELECT * FROM rel_queue_employee WHERE queueId = $1 AND userId = $2';
            const relResult = await client.query(relQuery, [queueId, userId]);
            if (relResult.rows.length === 0) {
                return res.status(404).send({ message: 'Funcionãrio não encontrado na fila.' });
            }

            // Remover a relação da tabela rel_queue_employee
            const deleteQuery = 'DELETE FROM rel_queue_employee WHERE queueId = $1 AND userId = $2 RETURNING *';
            const result = await client.query(deleteQuery, [queueId, userId]);

            res.status(200).send({ message: 'Funcionário removido da fila com sucesso!', assignment: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao remover funcionário da fila.', error: error.message });
        } finally {
            client.release();
        }
    }
}

export { RelQueueEmployeeController }