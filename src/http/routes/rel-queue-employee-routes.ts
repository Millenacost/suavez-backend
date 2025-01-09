import { FastifyInstance } from "fastify";
import { RelQueueEmployeeController } from "../../controllers/RelQueueEmployeeController";
import { relQueueEmployeeSchema } from "../../models/rel-queue-employee.model";

export async function relQueueEmployeeRoutes(fastify: FastifyInstance) {
    const relQueueEmployeeController = new RelQueueEmployeeController();

    fastify.post('/relQueueEmployee/register', { schema: relQueueEmployeeSchema }, async (req: any, res: any) => {
        return relQueueEmployeeController.registerEmployee(req, res);
    });

    fastify.get('/relQueueEmployee/:queueId', async (req: any, res: any) => {
        return relQueueEmployeeController.getEmployeesInQueue(req, res);
    });

    fastify.delete('/relQueueEmployee', async (req: any, res: any) => {
        return relQueueEmployeeController.removeEmployeeFromQueue(req, res);
    });
}