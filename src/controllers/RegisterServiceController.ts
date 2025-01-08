import { FastifyReply, FastifyRequest } from "fastify";
import { app } from "../http/server";
import { Service } from "../models/service.model";

class RegisterServiceController {
    async handle(req: FastifyRequest, res: FastifyReply){
        const client = await app.pg.connect()
        try {
            const service: Service = req.body as Service;


            // Verificando se servico ja existe
            const checkServiceExists = 'SELECT * FROM service WHERE name = $1 AND storeId = $2';
            const checkResult = await client.query(checkServiceExists, [service.name, service.storeId]);

            if (checkResult.rowCount > 0) {
                return res.status(400).send({ message: 'Servico já cadastrado.' });
            }

            const checkStoreExists = 'SELECT * FROM store WHERE id = $1';
            const checkResult2 = await client.query(checkStoreExists, [service.storeId]);

            if (checkResult2.rowCount === 0) {
                return res.status(400).send({ message: 'Estabelecimento não encontrado.' });
            }
    
            const query = `
                INSERT INTO service (storeId, name, description, price, serviceType, estimateType)
                VALUES ($1, $2, $3, $4, $5,$6)`;
    
            const values = [service.storeId, service.name, service.description, service.price, service.serviceType, service.estimateTime]    
    
            const result = await client.query(query, values);
            res.status(201).send({ message: 'Servico cadastrado com sucesso!', product: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao cadastrar servico.', error: error.message });
        } finally {
            client.release();
        }
    }
}

export { RegisterServiceController }