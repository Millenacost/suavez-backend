import { FastifyReply, FastifyRequest } from "fastify";
import { Store } from "../models/store.model";
import { app } from "../http/server";
import { Product } from "../models/product.model";

class ProductController {
    async register(req: FastifyRequest, res: FastifyReply){
        const client = await app.pg.connect()
        try {
            const product: Product = req.body as Product;

            if(!product.name || !product.storeId) {
                return res.status(400).send({ message: 'Nome ou estabelecimento não foi informado.' });
            }

            // Verificando se produto ja existe
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

    async delete(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId, productId } = req.params as { storeId: string, productId: string };

            if(!storeId || !productId) {    
                return res.status(400).send({ message: 'Estabelecimento ou produto não foi informado.' });
            }

            const query = 'DELETE FROM product WHERE id = $1 AND storeId = $2 RETURNING *';
            const result = await client.query(query, [productId, storeId]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Produto não encontrado.' });
            }

            res.status(200).send({ message: 'Produto deletado com sucesso!', product: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao deletar produto.', error: error.message });
        } finally {
            client.release();
        }
    }

    async update(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const product: Product = req.body as Product;

            const fields: string[] = [];
            const values: any[] = [];
            let index = 0;

            if (product.name !== null && product.name !== undefined) {
                fields.push(`name = $${index++}`);
                values.push(product.name);
            }
            if (product.description !== null && product.description !== undefined) {
                fields.push(`description = $${index++}`);
                values.push(product.description);
            }
            if (product.price !== null && product.price !== undefined) {
                fields.push(`price = $${index++}`);
                values.push(product.price);
            }
            if (product.productType !== null && product.productType !== undefined) {
                fields.push(`productType = $${index++}`);
                values.push(product.productType);
            }

            if (fields.length === 0) {
                return res.status(400).send({ message: 'Nenhum campo para atualizar.' });
            }

            values.push(product.id, product.storeId);
            const updateQuery = `
                UPDATE product
                SET ${fields.join(', ')}
                WHERE id = $${index++} AND storeId = $${index++}
                RETURNING *`;

            const result = await client.query(updateQuery, values);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Produto não encontrado.' });
            }

            res.status(200).send({ message: 'Produto atualizado com sucesso!', product: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao atualizar produto.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getAll(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId } = req.params as { storeId: string };

            if(!storeId) {
                return res.status(400).send({ message: 'Estabelecimento não foi informado.' }); 
            }

            const query = 'SELECT * FROM product WHERE storeId = $1';
            const result = await client.query(query, [storeId]);

            res.status(200).send(result.rows);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar produtos.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getByName(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId, name } = req.params as { storeId: string, name: string };

            if(!storeId || !name) {
                return res.status(400).send({ message: 'Estabelecimento ou produto não foi informado.' });
            }

            const query = 'SELECT * FROM product WHERE storeId = $1 AND name = $2';
            const result = await client.query(query, [storeId, name]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Produto não encontrado.' });
            }

            res.status(200).send(result.rows[0]);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar produto.', error: error.message });
        } finally {
            client.release();
        }
    }
}

export { ProductController }