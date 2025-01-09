import { FastifyReply, FastifyRequest } from "fastify";
import { app } from "../http/server";
import { Service } from "../models/service.model";

class ServiceController {
    async register(req: FastifyRequest, res: FastifyReply){
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

    async delete(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId, serviceId } = req.params as { storeId: string, serviceId: string };

            if(!storeId || !serviceId) {
                return res.status(400).send({ message: 'Estabelecimento ou serviço não foi informado.' });
            }

            const query = 'DELETE FROM service WHERE id = $1 AND storeId = $2 RETURNING *';
            const result = await client.query(query, [serviceId, storeId]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Serviço não encontrado.' });
            }

            res.status(200).send({ message: 'Serviço deletado com sucesso!', service: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao deletar serviço.', error: error.message });
        } finally {
            client.release();
        }
    }

    async update(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const service: Service = req.body as Service;

            const fields: string[] = [];
            const values: any[] = [];
            let index = 0;

            if (service.name !== null && service.name !== undefined) {
                fields.push(`name = $${index++}`);
                values.push(service.name);
            }
            if (service.description !== null && service.description !== undefined) {
                fields.push(`description = $${index++}`);
                values.push(service.description);
            }
            if (service.price !== null && service.price !== undefined) {
                fields.push(`price = $${index++}`);
                values.push(service.price);
            }
            if (service.serviceType !== null && service.serviceType !== undefined) {
                fields.push(`serviceType = $${index++}`);
                values.push(service.serviceType);
            }
            if (service.estimateTime !== null && service.estimateTime !== undefined) {
                fields.push(`estimateTime = $${index++}`);
                values.push(service.estimateTime);
            }

            if (fields.length === 0) {
                return res.status(400).send({ message: 'Nenhum campo para atualizar.' });
            }

            values.push(service.id, service.storeId);
            const updateQuery = `
                UPDATE service
                SET ${fields.join(', ')}
                WHERE id = $${index++} AND storeId = $${index++}
                RETURNING *`;

            const result = await client.query(updateQuery, values);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Serviço não encontrado.' });
            }

            res.status(200).send({ message: 'Serviço atualizado com sucesso!', service: result.rows[0] });
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao atualizar serviço.', error: error.message });
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

            const query = 'SELECT * FROM service WHERE storeId = $1';
            const result = await client.query(query, [storeId]);

            res.status(200).send(result.rows);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar serviços.', error: error.message });
        } finally {
            client.release();
        }
    }

    async getByName(req: FastifyRequest, res: FastifyReply) {
        const client = await app.pg.connect();
        try {
            const { storeId, name } = req.params as { storeId: string, name: string };

            if(!storeId || !name) {
                return res.status(400).send({ message: 'Estabelecimento ou nome do serviço não foi informado.' });
            }

            const query = 'SELECT * FROM service WHERE storeId = $1 AND name = $2';
            const result = await client.query(query, [storeId, name]);

            if (result.rowCount === 0) {
                return res.status(404).send({ message: 'Serviço não encontrado.' });
            }

            res.status(200).send(result.rows[0]);
        } catch (error: any) {
            res.status(500).send({ message: 'Erro ao buscar serviço.', error: error.message });
        } finally {
            client.release();
        }
    }

}

export { ServiceController }