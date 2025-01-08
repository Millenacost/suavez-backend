import { FastifyRequest, FastifyReply } from "fastify";
import { app } from "../http/server";
import { Queue, StatusQueueEnum } from "../models/queue.model";

class RegisterQueueController {
    async handle(req: FastifyRequest, res: FastifyReply) {
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
}

export { RegisterQueueController }