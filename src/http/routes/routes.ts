import { FastifyInstance, FastifyPluginOptions, FastifySchema } from "fastify";
import { RegisterStoreController } from "../../controllers/RegisterStoreController";
import { RegisterUserController } from "../../controllers/RegisterUserController";
import { LoginController } from "../../controllers/LoginController";
import { RegisterProductController } from "../../controllers/RegisterProductController";
import { RegisterServiceController } from "../../controllers/RegisterServiceController";
import { RegisterQueueController } from "../../controllers/RegisterQueueController";
import { queueSchema } from "../../models/queue.model";
import { storeSchema } from "../../models/store.model";
import { productSchema } from "../../models/product.model";
import { serviceSchema } from "../../models/service.model";
import { userSchema } from "../../models/user.model";

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.post('/store/register', { schema:storeSchema },async (req: any, res: any) => {
        return new RegisterStoreController().handle(req, res);
    });

    fastify.post('/user/register', { schema:userSchema },async (req: any, res: any) => {
        return new RegisterUserController().handle(req, res);
    });

    fastify.post('/login', async (req:any, res:any) => {
        return new LoginController().handle(req, res);
    });

    fastify.post('/product/register',  { schema:productSchema },async (req:any, res:any) => {
        return new RegisterProductController().handle(req, res);
    });

    fastify.post('/service/register',  { schema:serviceSchema },async (req:any, res:any) => {
        return new RegisterServiceController().handle(req, res);
    });

    fastify.post('/queue/register',  { schema:queueSchema },async (req:any, res:any) => {
        return new RegisterQueueController().handle(req, res);
    });

    
}