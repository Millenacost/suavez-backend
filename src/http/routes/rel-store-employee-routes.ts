import { FastifyInstance } from "fastify";
import { RelStoreEmployeeController } from "../../controllers/RelStoreEmployeeController";
import { relStoreEmployeeSchema } from "../../models/rel-store-employee.model";

export async function relStoreEmployeeRoutes(fastify: FastifyInstance) {
    const relStoreEmployeeController = new RelStoreEmployeeController();

    fastify.post('/relStoreEmployee/register', { schema: relStoreEmployeeSchema }, async (req: any, res: any) => {
        return relStoreEmployeeController.registerEmployee(req, res);
    });

    fastify.delete('/relStoreEmployee/:storeId/:userId', async (req: any, res: any) => {
        return relStoreEmployeeController.removeEmployee(req, res);
    });

    fastify.get('/relStoreEmployee/store/:storeId', async (req: any, res: any) => {
        return relStoreEmployeeController.getEmployeesByStore(req, res);
    });

    fastify.get('/relStoreEmployee/user/:userId', async (req: any, res: any) => {
        return relStoreEmployeeController.getStoresByEmployee(req, res);
    });
}