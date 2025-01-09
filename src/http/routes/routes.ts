import { FastifyInstance, FastifyPluginOptions, FastifySchema } from "fastify";
import { RegisterStoreController } from "../../controllers/RegisterStoreController";
import { RegisterUserController } from "../../controllers/RegisterUserController";
import { LoginController } from "../../controllers/LoginController";
import { storeSchema } from "../../models/store.model";
import { userSchema } from "../../models/user.model";
import { RelQueueEmployeeController } from "../../controllers/RelQueueEmployeeController";
import { relQueueEmployeeSchema } from "../../models/rel-queue-employee.model";

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get("/", async (req:any, res:any) => {
        return res.send("Fastify on Vercel")});
    
    fastify.post('/store/register', { schema:storeSchema },async (req: any, res: any) => {
        return new RegisterStoreController().handle(req, res);
    });

    fastify.post('/user/register', { schema:userSchema },async (req: any, res: any) => {
        return new RegisterUserController().handle(req, res);
    });

    fastify.post('/login', async (req:any, res:any) => {
        return new LoginController().handle(req, res);
    });

    fastify.post('/relQueueEmployee/register',  { schema:relQueueEmployeeSchema },async (req:any, res:any) => {
        return new RelQueueEmployeeController().registerEmployee(req, res);
    });

    fastify.post('/relQueueEmployee/getEmployessInQueue',async (req:any, res:any) => {
        return new RelQueueEmployeeController().getEmployeesInQueue(req, res);
    });

    fastify.post('/relQueueEmployee/deleteEmployeeInQueue',async (req:any, res:any) => {
        return new RelQueueEmployeeController().removeEmployeeFromQueue(req, res);
    });

    
}