import { FastifyReply, FastifyRequest } from "fastify";
import { StatusStoreEnum, Store } from "../models/store.model";
import { app } from "../http/server";

class StoreController {
	async register(req: FastifyRequest, res: FastifyReply) {
		const client = await app.pg.connect();
		try {
			const store: Store = req.body as Store;

			// Verificando se estabelecimento já existe (por nome)
			const checkStoreExists = "SELECT * FROM store WHERE name = $1";
			const checkResult = await client.query(checkStoreExists, [store.name]);

			if (checkResult.rows.length > 0) {
				return res
					.status(409)
					.send({
						message: "Já existe um estabelecimento cadastrado com este nome.",
					});
			}

			// Verificando se dono já existe
			const checkOwnerExists = "SELECT * FROM users WHERE id = $1";
			const checkResult2 = await client.query(checkOwnerExists, [
				store.ownerId,
			]);

			if (checkResult2.rows.length === 0) {
				return res.status(400).send({ message: "Usuário não encontrado." });
			}

			const query = `
                INSERT INTO store (ownerId, name, description, registeringDate, lastUpDate, phone, street, number, city, state, logo, backgrounding, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;

			const values = [
				store.ownerId,
				store.name,
				store.description,
				store.registeringDate,
				store.lastUpDate,
				store.phone,
				store.street,
				store.number,
				store.city,
				store.state,
				store.logo,
				store.backgrounding,
				StatusStoreEnum.Open,
			];

			const result = await client.query(query, values);
			res
				.status(201)
				.send({
					message: "Estabelecimento cadastrado com sucesso!",
					store: result.rows[0],
				});
		} catch (error: any) {
			res
				.status(500)
				.send({
					message: "Erro ao cadastrar estabelecimento.",
					error: error.message,
				});
		} finally {
			client.release();
		}
	}

	async delete(req: FastifyRequest, res: FastifyReply) {
		const client = await app.pg.connect();
		try {
			const { storeId } = req.params as { storeId: string };

			if (!storeId) {
				return res
					.status(400)
					.send({ message: "ID do estabelecimento não informado." });
			}

			const query = "DELETE FROM store WHERE id = $1 RETURNING *";
			const result = await client.query(query, [storeId]);

			if (result.rowCount === 0) {
				return res
					.status(404)
					.send({ message: "Estabelecimento não encontrado." });
			}

			res
				.status(200)
				.send({
					message: "Estabelecimento deletado com sucesso!",
					store: result.rows[0],
				});
		} catch (error: any) {
			res
				.status(500)
				.send({
					message: "Erro ao deletar estabelecimento.",
					error: error.message,
				});
		} finally {
			client.release();
		}
	}

	async update(req: FastifyRequest, res: FastifyReply) {
		const client = await app.pg.connect();
		try {
			const store: Store = req.body as Store;

			const fields: string[] = [];
			const values: any[] = [];
			let index = 0;

			if (store.name !== null && store.name !== undefined) {
				fields.push(`name = $${index++}`);
				values.push(store.name);
			}
			if (store.description !== null && store.description !== undefined) {
				fields.push(`description = $${index++}`);
				values.push(store.description);
			}
			if (store.phone !== null && store.phone !== undefined) {
				fields.push(`phone = $${index++}`);
				values.push(store.phone);
			}
			if (store.street !== null && store.street !== undefined) {
				fields.push(`street = $${index++}`);
				values.push(store.street);
			}
			if (store.number !== null && store.number !== undefined) {
				fields.push(`number = $${index++}`);
				values.push(store.number);
			}
			if (store.city !== null && store.city !== undefined) {
				fields.push(`city = $${index++}`);
				values.push(store.city);
			}
			if (store.state !== null && store.state !== undefined) {
				fields.push(`state = $${index++}`);
				values.push(store.state);
			}
			if (store.logo !== null && store.logo !== undefined) {
				fields.push(`logo = $${index++}`);
				values.push(store.logo);
			}
			if (store.backgrounding !== null && store.backgrounding !== undefined) {
				fields.push(`backgrounding = $${index++}`);
				values.push(store.backgrounding);
			}
			if (store.status !== null && store.status !== undefined) {
				fields.push(`status = $${index++}`);
				values.push(store.status);
			}

			// Adiciona a data de atualização em GMT (UTC)
			fields.push(`lastUpDate = $${index++}`);
			values.push(new Date().toISOString());

			if (fields.length === 0) {
				return res
					.status(400)
					.send({ message: "Nenhum campo para atualizar." });
			}

			values.push(store.id);
			const updateQuery = `
                UPDATE store
                SET ${fields.join(", ")}
                WHERE id = $${index++}
                RETURNING *`;

			const result = await client.query(updateQuery, values);

			if (result.rowCount === 0) {
				return res
					.status(404)
					.send({ message: "Estabelecimento não encontrado." });
			}

			res
				.status(200)
				.send({
					message: "Estabelecimento atualizado com sucesso!",
					store: result.rows[0],
				});
		} catch (error: any) {
			res
				.status(500)
				.send({
					message: "Erro ao atualizar estabelecimento.",
					error: error.message,
				});
		} finally {
			client.release();
		}
	}

	async getAll(req: FastifyRequest, res: FastifyReply) {
		const client = await app.pg.connect();
		try {
			const query = "SELECT * FROM store";
			const result = await client.query(query);

			res.status(200).send(result.rows);
		} catch (error: any) {
			res
				.status(500)
				.send({
					message: "Erro ao buscar estabelecimentos.",
					error: error.message,
				});
		} finally {
			client.release();
		}
	}

	async getAllWithServices(req: FastifyRequest, res: FastifyReply) {
		const client = await app.pg.connect();
		try {
			const query = `
            SELECT store.*, 
                   COALESCE(json_agg(service.*) FILTER (WHERE service.id IS NOT NULL), '[]') AS services
            FROM store
            LEFT JOIN service ON store.id = service."storeId"
            GROUP BY store.id`;

			const result = await client.query(query);

			res.status(200).send(result.rows);
		} catch (error: any) {
			res
				.status(500)
				.send({
					message: "Erro ao buscar estabelecimentos com serviços.",
					error: error.message,
				});
		} finally {
			client.release();
		}
	}

	async getAllWithServicesAndSmallestQueue(
		req: FastifyRequest,
		res: FastifyReply
	) {
		const client = await app.pg.connect();
		try {
			const query = `
                SELECT store.*, 
                       COALESCE(json_agg(service.*) FILTER (WHERE service.id IS NOT NULL), '[]') AS services,
                       (
                           SELECT json_build_object('id', q.id, 'name', q.name, 'customer_count', COUNT(rqc.userId))
                           FROM queue q
                           LEFT JOIN rel_queue_customer rqc ON q.id = rqc."queueId"
                           WHERE q."storeId" = store.id
                           GROUP BY q.id
                           ORDER BY COUNT(rqc.userId) ASC
                           LIMIT 1
                       ) AS smallest_queue
                FROM store
                LEFT JOIN service ON store.id = service."storeId"
                GROUP BY store.id
            `;
			const result = await client.query(query);

			res.status(200).send(result.rows);
		} catch (error: any) {
			res
				.status(500)
				.send({
					message: "Erro ao buscar estabelecimentos com serviços.",
					error: error.message,
				});
		} finally {
			client.release();
		}
	}

	async getAllWithServicesAndSmallestQueueByName(
		req: FastifyRequest,
		res: FastifyReply
	) {
		const client = await app.pg.connect();
		try {
			const { name } = req.params as { name: string };

			if (!name) {
				return res
					.status(400)
					.send({ message: "Nome do estabelecimento não informado." });
			}

			const query = `
                SELECT store.*, 
                       COALESCE(json_agg(service.*) FILTER (WHERE service.id IS NOT NULL), '[]') AS services,
                       (
                           SELECT json_build_object('id', q.id, 'name', q.name, 'customer_count', COUNT(rqc.userId))
                           FROM queue q
                           LEFT JOIN rel_queue_customer rqc ON q.id = rqc."queueId"
                           WHERE q."storeId" = store.id
                           GROUP BY q.id
                           ORDER BY COUNT(rqc.userId) ASC
                           LIMIT 1
                       ) AS smallest_queue
                FROM store
                LEFT JOIN service ON store.id = service."storeId"
                WHERE store.name ILIKE $1
                GROUP BY store.id
            `;
			const result = await client.query(query, [`%${name}%`]);

			res.status(200).send(result.rows);
		} catch (error: any) {
			res
				.status(500)
				.send({
					message: "Erro ao buscar estabelecimentos com serviços.",
					error: error.message,
				});
		} finally {
			client.release();
		}
	}

	async getByName(req: FastifyRequest, res: FastifyReply) {
		const client = await app.pg.connect();
		try {
			const { name } = req.params as { name: string };

			if (!name) {
				return res
					.status(400)
					.send({ message: "Nome do estabelecimento não informado." });
			}

			const query = "SELECT * FROM store WHERE name ILIKE $1";
			const result = await client.query(query, [`%${name}%`]);

			if (result.rowCount === 0) {
				return res
					.status(404)
					.send({ message: "Estabelecimento não encontrado." });
			}

			res.status(200).send(result.rows[0]);
		} catch (error: any) {
			res
				.status(500)
				.send({
					message: "Erro ao buscar estabelecimento.",
					error: error.message,
				});
		} finally {
			client.release();
		}
	}

	async getByOwner(req: FastifyRequest, res: FastifyReply) {
		const client = await app.pg.connect();
		try {
			const { ownerId } = req.params as { ownerId: string };

			if (!ownerId) {
				return res.status(400).send({ message: "ID do dono não informado." });
			}

			const query = "SELECT * FROM store WHERE ownerId = $1";
			const result = await client.query(query, [ownerId]);

			if (result.rowCount === 0) {
				return res
					.status(200)
					.send({
						rows: result.rows,
						message: "Nenhum estabelecimento encontrado para este dono.",
					});
			}

			res.status(200).send({ rows: result.rows });
		} catch (error: any) {
			res
				.status(500)
				.send({
					message: "Erro ao buscar estabelecimentos.",
					error: error.message,
				});
		} finally {
			client.release();
		}
	}
}

export { StoreController };
