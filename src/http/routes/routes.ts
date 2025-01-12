import { FastifyInstance, FastifyPluginOptions, FastifySchema } from "fastify";
import { LoginController } from "../../controllers/LoginController";
import { userSchema } from "../../models/user.model";
import { RelQueueEmployeeController } from "../../controllers/RelQueueEmployeeController";
import { relQueueEmployeeSchema } from "../../models/rel-queue-employee.model";
import { productRoutes } from "./product-routes";
import { queueRoutes } from "./queue-routes";
import { relQueueCustomerRoutes } from "./rel-queue-customer-routes";
import { relQueueEmployeeRoutes } from "./rel-queue-employee-routes";
import { serviceRoutes } from "./service-routes";
import { storeRoutes } from "./store-routes";
import { relStoreEmployeeRoutes } from "./rel-store-employee-routes";
import { userRoutes } from "./user-routes";

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.register(productRoutes);
    fastify.register(queueRoutes);
    fastify.register(relQueueCustomerRoutes);
    fastify.register(relQueueEmployeeRoutes);
    fastify.register(serviceRoutes);
    fastify.register(storeRoutes);
    fastify.register(relStoreEmployeeRoutes);
    fastify.register(userRoutes);
    
}