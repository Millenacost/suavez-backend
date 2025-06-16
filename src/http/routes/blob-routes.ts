import { FastifyInstance } from 'fastify';
import { BlobController } from '../../controllers/BlobController';

export async function blobRoutes(fastify: FastifyInstance) {
    const blobController = new BlobController();

    fastify.post("/blob/generateToken", async (req: any, res: any) => {
        return blobController.handle(req, res);
    });
}