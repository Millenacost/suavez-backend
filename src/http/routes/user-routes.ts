import { FastifyInstance } from 'fastify';
import { UserController } from '../../controllers/UserController';
import { userSchema } from '../../models/user.model';

export async function userRoutes(fastify: FastifyInstance) {
    const userController = new UserController();

    fastify.post('/user', { schema: userSchema }, async (req: any, res: any) => {
        return userController.register(req, res);
    });

    fastify.delete('/user/:userId', async (req: any, res: any) => {
        return userController.delete(req, res);
    });

    fastify.put('/user', async (req: any, res: any) => {
        return userController.update(req, res);
    });

    fastify.get('/user/cpf/:cpf', async (req: any, res: any) => {
        return userController.getByCpf(req, res);
    });

    fastify.get('/user/name/:name', async (req: any, res: any) => {
        return userController.getByName(req, res);
    });

    fastify.get('/user/email/:email', async (req: any, res: any) => {
        return userController.getByEmail(req, res);
    });

    fastify.get('/user/:userId', async (req: any, res: any) => {
        return userController.getById(req, res);
    });
}