import { FastifyRequest, FastifyReply } from "fastify";
import { app } from "../http/server";
import { Queue, StatusQueueEnum } from "../models/queue.model";

class QueueController {
    async register(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const queue: Queue = req.body as Queue;

            // Verificando se fila já existe 
            const checkQueueExists = 'SELECT * FROM queue WHERE name = $1';
            const checkResult = await client.query(checkQueueExists, [queue.name]);

            const checkStoreExists = 'SELECT * FROM store WHERE id = $1';
            const checkResult2 = await client.query(checkStoreExists, [queue.storeId]);


            if (checkResult.rows.length > 0) {
                return res.status(409).send({ message: 'Já existe uma fila cadastrada com este nome.' });
            }
            if(checkResult2.rows.length === 0){ 
                return res.status(409).send({ message: 'Estabelecimento não existe.' });
            }

            const query = `
                INSERT INTO queue (storeId, name, description, registeringDate, lastUpDate, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;

            const values = [queue.storeId, queue.name, queue.description, queue.registeringDate, queue.lastUpDate, StatusQueueEnum.Closed];

            const result = await client.query(query, values);
            res.status(201).send({ message: 'Fila cadastrada com sucesso!', store: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao cadastrar fila.', error: error.message });
        } finally {
            client.release();
        }
    }

    async delete(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId, queueId } = req.params as { storeId: string, queueId: string };

            if(!storeId || !queueId) {
                return res.status(400).send({ message: 'Estabelecimento ou fila não foi informado.' });
            }

            const query = 'DELETE FROM queue WHERE id = $1 AND storeId = $2 RETURNING *';
            const result = await client.query(query, [queueId, storeId]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Fila não encontrada.' });
            }

            res.status(200).send({ message: 'Fila deletada com sucesso!', queue: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao deletar fila.', error: error.message });
        } finally {
            client.release();
        }
    }

    async update(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const queue: Queue = req.body as Queue;

            const fields: string[] = [];
            const values: any[] = [];
            let index = 0;

            if (queue.name !== null && queue.name !== undefined) {
                fields.push(`name = $${index++}`);
                values.push(queue.name);
            }
            if (queue.description !== null && queue.description !== undefined) {
                fields.push(`description = $${index++}`);
                values.push(queue.description);
            }
            if (queue.status !== null && queue.status !== undefined) {
                fields.push(`status = $${index++}`);
                values.push(queue.status);
            }

            if (fields.length === 0) {
                return res.status(400).send({ message: 'Nenhum campo para atualizar.' });
            }

            // Adiciona a data de atualização em GMT (UTC) pos o banco esta GMT
            fields.push(`lastUpDate = $${index++}`);
            values.push(new Date().toISOString());

            values.push(queue.id, queue.storeId);
            const updateQuery = `
                UPDATE queue
                SET ${fields.join(', ')}
                WHERE id = $${index++} AND storeId = $${index++}
                RETURNING *`;

            const result = await client.query(updateQuery, values);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Fila não encontrada.' });
            }

            res.status(200).send({ message: 'Fila atualizada com sucesso!', queue: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao atualizar fila.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getByNameByStore(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId, name } = req.params as { storeId: string, name: string };

            if(!storeId || !name) {
                return res.status(400).send({ message: 'Estabelecimento ou nome da fila não foi informado.' });
            }

            const query = 'SELECT * FROM queue WHERE storeId = $1 AND name ILIKE $2';
            const result = await client.query(query, [storeId, `%${name}%`]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Fila não encontrada.' });
            }

            res.status(200).send(result.rows[0]);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar fila.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getAvailableQueues(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId } = req.params as { storeId: string };

            if (!storeId) {
                return res.status(400).send({ message: 'Estabelecimento não informado.' });
            }

            const query = 'SELECT * FROM queue WHERE storeId = $1 AND status != $2';
            const result = await client.query(query, [storeId, StatusQueueEnum.Closed]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Nenhuma fila disponível encontrada.' });
            }

            res.status(200).send(result.rows);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar filas disponíveis.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getQueuesAvaiblesAndEmployee(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId } = req.params as { storeId: string };

            if (!storeId) {
                return res.status(400).send({ message: 'ID do estabelecimento não informado.' });
            }

            const query = `
                SELECT queue.*, 
                       CONCAT(users.name, ' ', users.lastName) AS employee_name,
                       COUNT(rqc.userId) AS customer_count
                FROM queue
                LEFT JOIN users ON queue.employeeId = users.id
                LEFT JOIN rel_queue_customer rqc ON queue.id = rqc.queueId
                WHERE queue."storeId" = $1 AND queue.status != $2
                GROUP BY queue.id, users.name, users.lastName
            `;
            const result = await client.query(query, [storeId, StatusQueueEnum.Closed]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Nenhuma fila disponível encontrada para este estabelecimento.' });
            }

            res.status(200).send(result.rows);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar filas.', error: error.message });
        } finally {
            client.release();
        }
    }




}

export { QueueController }