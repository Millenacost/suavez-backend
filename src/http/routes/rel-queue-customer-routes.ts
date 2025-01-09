import { FastifyInstance } from "fastify";
import { RelQueueCustomerController } from "../../controllers/RelQueueCustomerController";
import { relQueueCustomerSchema } from "../../models/rel-queue-customer.model";

export async function relQueueCustomerRoutes(fastify: FastifyInstance) {
    const relQueueCustomerController = new RelQueueCustomerController();

    fastify.post('/relQueueCustomer/register', { schema: relQueueCustomerSchema }, async (req: any, res: any) => {
        return relQueueCustomerController.registerCustomerInQueue(req, res);
    });

    fastify.delete('/relQueueCustomer/:queueId/:userId', async (req: any, res: any) => {
        return relQueueCustomerController.removeCustomerFromQueue(req, res);
    });

    fastify.put('/relQueueCustomer/update', async (req: any, res: any) => {
        return relQueueCustomerController.updateCustomerInQueue(req, res);
    });

    fastify.get('/relQueueCustomer/:queueId', async (req: any, res: any) => {
        return relQueueCustomerController.getCustomersInQueue(req, res);
    });

    fastify.get('/customer-queues/:userId', async (req: any, res: any) => {
        return relQueueCustomerController.getQueuesCustomer(req, res);
    });
}