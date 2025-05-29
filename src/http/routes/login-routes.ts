import { FastifyInstance } from 'fastify';
import { LoginController } from '../../controllers/LoginController';

export async function loginRoutes(fastify: FastifyInstance) {
    const loginController = new LoginController();

    fastify.post("/auth/login", async (req: any, res: any) => {
        return loginController.handle(req, res);
    });
}