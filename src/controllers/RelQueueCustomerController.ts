import { FastifyReply, FastifyRequest } from "fastify";
import { app } from "../http/server";
import { RelQueueEmployee } from "../models/rel-queue-employee.model";
import { RelQueueCustomer, StatusCustomerEnum } from "../models/rel-queue-customer.model";

class RelQueueCustomerController {
    async registerCustomerInQueue(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { queueId, userId } = req.body as RelQueueCustomer;

            if(!queueId || !userId) {
                return res.status(400).send({ message: 'Fila ou cliente não foi informado.' });
            }

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
                return res.status(404).send({ message: 'Cliente não encontrado.' });
            }

            // Verificar se o cliente já está cadastrado na fila
            const checkQuery = 'SELECT * FROM rel_queue_customer WHERE queueId = $1 AND userId = $2';
            const checkResult = await client.query(checkQuery, [queueId, userId]);
            if(checkResult.rows.length > 0) {
                return res.status(409).send({ message: 'Cliente já cadastrado na fila.' });
            }

            const query = `
                INSERT INTO rel_queue_customer (queueId, userId, status)
                VALUES ($1, $2, $3)
                RETURNING *`;

            const values = [queueId, userId, StatusCustomerEnum.WAITING];

            const result = await client.query(query, values);
            res.status(201).send({ message: 'Cliente cadastrado na fila com sucesso!', assignment: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao cadastrar cliente na fila.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getCustomersInQueue(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { queueId } = req.params as { queueId: string };

            if (!queueId) {
                return res.status(400).send({ message: 'Fila não foi informada.' });
            }

            // Verificar se queueId existe na tabela queue
            const queueQuery = 'SELECT id FROM queue WHERE id = $1';
            const queueResult = await client.query(queueQuery, [queueId]);
            if (queueResult.rows.length === 0) {
                return res.status(404).send({ message: 'Fila não encontrada.' });
            }

            // Buscar todos os clientes na fila
            const query = `
                SELECT users.*
                FROM rel_queue_customer
                JOIN users ON rel_queue_customer.customerId = users.id
                WHERE rel_queue_customer.queueId = $1`;
            const result = await client.query(query, [queueId]);

            res.status(200).send(result.rows);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar clientes na fila.', error: error.message });
        } finally {
            client.release();
        }
    }

    async removeCustomerFromQueue(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { queueId, userId } = req.params as { queueId: number, userId: number };

            if (!queueId || !userId) {
                return res.status(400).send({ message: 'Fila ou cliente não foi informado.' });
            }

            // Verificar se a relação existe na tabela rel_queue_customer
            const relQuery = 'SELECT * FROM rel_queue_customer WHERE queueId = $1 AND userId = $2';
            const relResult = await client.query(relQuery, [queueId, userId]);
            if (relResult.rows.length === 0) {
                return res.status(404).send({ message: 'Cliente não encontrado na fila.' });
            }

            // Remover a relação da tabela rel_queue_customer
            const deleteQuery = 'DELETE FROM rel_queue_customer WHERE queueId = $1 AND userId = $2 RETURNING *';
            const result = await client.query(deleteQuery, [queueId, userId]);

            res.status(200).send({ message: 'Cliente removido da fila com sucesso!', assignment: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao remover cliente da fila.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getQueuesCustomer(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { userId } = req.params as { userId: string };

            if (!userId) {
                return res.status(400).send({ message: 'Cliente não foi informado.' });
            }

            // Verificar se userId existe na tabela users
            const customerQuery = 'SELECT id FROM users WHERE id = $1';
            const customerResult = await client.query(customerQuery, [userId]);
            if (customerResult.rows.length === 0) {
                return res.status(404).send({ message: 'Cliente não encontrado.' });
            }

            // Buscar todas as filas em que o cliente está
            const query = `
                SELECT queue.*
                FROM rel_queue_customer
                JOIN queue ON rel_queue_customer.queueId = queue.id
                WHERE rel_queue_customer.userId = $1`;
            const result = await client.query(query, [userId]);

            res.status(200).send(result.rows);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar filas para o cliente.', error: error.message });
        } finally {
            client.release();
        }
    }

    async updateCustomerInQueue(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const relQueueCustomer: RelQueueCustomer = req.body as RelQueueCustomer;

            if(!relQueueCustomer.queueId || !relQueueCustomer.userId) {
                return res.status(400).send({ message: 'Fila ou cliente não foi informado.' });
            }

            // Verificar se o registro existe na tabela rel_queue_customer
            const checkQuery = 'SELECT * FROM rel_queue_customer WHERE userId = $1 AND queueId = $2';
            const checkResult = await client.query(checkQuery, [relQueueCustomer.userId, relQueueCustomer.queueId]);
            
            if (checkResult.rows.length === 0) {
                return res.status(404).send({ message: 'Registro não encontrado.' });
            }

            const fields: string[] = [];
            const values: any[] = [];
            let index = 0;

            if (relQueueCustomer.queueId !== null && relQueueCustomer.queueId !== undefined) {
                fields.push(`queueId = $${index++}`);
                values.push(relQueueCustomer.queueId);
            }
            if (relQueueCustomer.userId !== null && relQueueCustomer.userId !== undefined) {
                fields.push(`userId = $${index++}`);
                values.push(relQueueCustomer.userId);
            }
            if (relQueueCustomer.entryDateQueue !== null && relQueueCustomer.entryDateQueue !== undefined) {
                fields.push(`entryDateQueue = $${index++}`);
                values.push(relQueueCustomer.entryDateQueue);
            }
            if (relQueueCustomer.exitDateQueue !== null && relQueueCustomer.exitDateQueue !== undefined) {
                fields.push(`exitDateQueue = $${index++}`);
                values.push(relQueueCustomer.exitDateQueue);
            }
            if (relQueueCustomer.initAttendDate !== null && relQueueCustomer.initAttendDate !== undefined) {
                fields.push(`initAttendDate = $${index++}`);
                values.push(relQueueCustomer.initAttendDate);
            }
            if (relQueueCustomer.exitAttendDate !== null && relQueueCustomer.exitAttendDate !== undefined) {
                fields.push(`exitAttendDate = $${index++}`);
                values.push(relQueueCustomer.exitAttendDate);
            }
            if (relQueueCustomer.status !== null && relQueueCustomer.status !== undefined) {
                fields.push(`status = $${index++}`);
                values.push(relQueueCustomer.status);
            }

            if (fields.length === 0) {
                return res.status(400).send({ message: 'Nenhum campo para atualizar.' });
            }

            values.push(relQueueCustomer.queueId, relQueueCustomer.userId);
            const updateQuery = `
                UPDATE rel_queue_customer
                SET ${fields.join(', ')}
                WHERE queueId = $${index++} AND userId = $${index++}
                RETURNING *`;

            const result = await client.query(updateQuery, values);
            res.status(200).send({ message: 'Registro atualizado com sucesso!', assignment: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao atualizar o registro.', error: error.message });
        } finally {
            client.release();
        }
    }
}

export { RelQueueCustomerController };