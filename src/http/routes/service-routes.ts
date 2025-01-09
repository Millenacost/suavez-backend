import { FastifyInstance } from 'fastify';
import { ServiceController } from '../../controllers/ServiceController';
import { serviceSchema } from '../../models/service.model';

export async function serviceRoutes(fastify: FastifyInstance) {
    const serviceController = new ServiceController();

    fastify.post('/service/register',  { schema:serviceSchema },async (req:any, res:any) => {
        return serviceController.register(req, res);
    });

    fastify.delete('/service/:serviceId/:storeId', async (req: any, res: any) => {
        return serviceController.delete(req, res);
    });

    fastify.put('/service/update',  async (req: any, res: any) => {
        return serviceController.update(req, res);
    });

    fastify.get('/service/getAllByStore/:storeId', async (req: any, res: any) => {
        return serviceController.getAll(req, res);
    });

    fastify.get('/service/getByNameByStore/:storeId/:name', async (req: any, res: any) => {
        return serviceController.getByName(req, res);
    });
}