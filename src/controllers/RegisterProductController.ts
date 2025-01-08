import { FastifyReply, FastifyRequest } from "fastify";
import { Store } from "../models/store.model";
import { app } from "../http/server";
import { Product } from "../models/product.model";

class RegisterProductController {
    async handle(req: FastifyRequest, res: FastifyReply){
        const client = await app.pg.connect()
        try {
            const product: Product = req.body as Product;

            // Verificando se fila já existe 
            const checkProductExists = 'SELECT * FROM product WHERE name = $1 AND storeId = $2';
            const checkResult = await client.query(checkProductExists, [product.name, product.storeId]);

            if (checkResult.rowCount > 0) {
                return res.status(400).send({ message: 'Produto já cadastrado.' });

            }

            const checkStoreExists = 'SELECT * FROM store WHERE id = $1';
            const checkResult2 = await client.query(checkStoreExists, [product.storeId]);

            if (checkResult2.rowCount === 0) {
                return res.status(400).send({ message: 'Estabelecimento não encontrado.' });
            }

            const query = `
                INSERT INTO product (storeId, name, description, price, productType)
                VALUES ($1, $2, $3, $4, $5,)`;
    
            const values = [product.storeId, product.name, product.description, product.price, product.productType]    
    
            const result = await client.query(query, values);
            res.status(201).send({ message: 'Produto cadastrado com sucesso!', product: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao cadastrar produto.', error: error.message });
        } finally {
            client.release();
        }
    }
}

export { RegisterProductController }