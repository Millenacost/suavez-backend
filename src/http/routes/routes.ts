import { FastifyInstance, FastifyPluginOptions, FastifySchema } from "fastify";
import { RegisterStoreController } from "../../controllers/RegisterStoreController";
import { RegisterUserController } from "../../controllers/RegisterUserController";
import { LoginController } from "../../controllers/LoginController";
import { RegisterProductController } from "../../controllers/RegisterProductController";

const storeSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['ownerId', 'name', 'description'], 
        properties: {
            ownerId: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string' },
            registeringDate: { type: 'string', nullable: true },
            lastUpDate: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            street: { type: 'string', nullable: true },
            number: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            state: { type: 'string', nullable: true },
            logo: { type: 'string', nullable: true },
            backgrounding: { type: 'string', nullable: true },
            status: { type: 'string', nullable: true },
        },
        additionalProperties: false,
    },
};

const userSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['name', 'cpf', 'email', 'password'],
        properties: {
            name: { type: 'string' },
            lastName: { type: 'string' },
            registeringDate: { type: 'string', nullable: true },
            lastUpDate: { type: 'string', nullable: true },
            cpf: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            phone: { type: 'string', nullable: true },
            street: { type: 'string', nullable: true },
            number: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            state: { type: 'string', nullable: true },
        },
        additionalProperties: false, // Não permite propriedades adicionais
    },
};

const productSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['storeId', 'name', 'description', 'price', 'productType'],
        properties: {
            storeId: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            productType: { type: 'string' }
        },
        additionalProperties: false, // Não permite propriedades adicionais
    },
};


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

    
}