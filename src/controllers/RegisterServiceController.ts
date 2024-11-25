import { FastifyReply, FastifyRequest } from "fastify";
import { Store } from "../models/store.model";
import { app } from "../http/server";
import { Product } from "../models/product.model";
import { Service } from "../models/service.model";

class RegisterServiceController {
    async handle(req: FastifyRequest, res: FastifyReply){
        const client = await app.pg.connect()
        try {
            const service: Service = req.body as Service;
    
            const query = `
                INSERT INTO product (storeId, name, description, price, serviceType, estimateType)
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