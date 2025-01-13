import { FastifyInstance } from 'fastify';
import { storeSchema } from '../../models/store.model';
import { StoreController } from '../../controllers/StoreController';

export async function storeRoutes(fastify: FastifyInstance) {
    const storeController = new StoreController();

    fastify.post('/store/register', { schema: storeSchema }, async (req: any, res: any) => {
        return storeController.register(req, res);
    });

    fastify.delete('/store/:storeId', async (req: any, res: any) => {
        return storeController.delete(req, res);
    });

    fastify.put('/store/update', async (req: any, res: any) => {
        return storeController.update(req, res);
    });

    fastify.get('/store/getAll', async (req: any, res: any) => {
        return storeController.getAllWithServices(req, res);
    });

    fastify.get('/store/getAllWithSmallestQueue', async (req: any, res: any) => {
        return storeController.getAllWithServicesAndSmallestQueue(req, res);
    });

    fastify.get('/store/getAllWithSmallestQueueByName/:name', async (req: any, res: any) => {
        return storeController.getAllWithServicesAndSmallestQueueByName(req, res);
    });

    fastify.get('/store/name/:name', async (req: any, res: any) => {
        return storeController.getByName(req, res);
    });
    
    fastify.get('/store/owner/:ownerId', async (req: any, res: any) => {
        return storeController.getByOwner(req, res);
    });
}