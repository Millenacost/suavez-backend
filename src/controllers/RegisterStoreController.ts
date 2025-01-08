import { FastifyReply, FastifyRequest } from "fastify";
import { StatusStoreEnum, Store } from "../models/store.model";
import { app } from "../http/server";

class RegisterStoreController {
    async handle(req: FastifyRequest, res: FastifyReply){
        const client = await app.pg.connect()
        try {
            const store: Store = req.body as Store;
            
            // Verificando se estabelecimento já existe (por nome)
            const checkStoreExists = 'SELECT * FROM store WHERE name = $1';
            const checkResult = await client.query(checkStoreExists, [store.name]);
    
            if (checkResult.rows.length > 0) {
                return res.status(409).send({ message: 'Já existe um estabelecimento cadastrado com este nome.' });
            }
    
            const query = `
                INSERT INTO store (ownerId, name, description, registeringDate, lastUpDate, phone, street, number, city, state, logo, backgrounding, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;
    
            const values = [store.ownerId, store.name, store.description, store.registeringDate, store.lastUpDate, store.phone, 
                store.street, store.number, store.city, store.state, store.logo, store.backgrounding, StatusStoreEnum.Open]    
    
            const result = await client.query(query, values);
            res.status(201).send({ message: 'Estabelecimento cadastrado com sucesso!', store: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao cadastrar estabelecimento.', error: error.message });
        } finally {
            client.release();
        }
    }
}

export { RegisterStoreController }