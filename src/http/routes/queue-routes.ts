import { FastifyInstance } from 'fastify';
import { QueueController } from '../../controllers/QueueController';
import { queueSchema } from '../../models/queue.model';

export async function queueRoutes(fastify: FastifyInstance) {
    const queueController = new QueueController();

    fastify.post('/queue/register',  { schema:queueSchema },async (req:any, res:any) => {
        return queueController.register(req, res);
    });

    fastify.delete('/queue/delete', async (req: any, res: any) => {
        return queueController.delete(req, res);
    });

    fastify.put('/queue/update', async (req: any, res: any) => {
        return queueController.update(req, res);
    });

    fastify.get('/queue/getByName', async (req: any, res: any) => {
        return queueController.getByNameByStore(req, res);
    });

}