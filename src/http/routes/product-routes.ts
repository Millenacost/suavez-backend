import { FastifyInstance } from 'fastify';
import { ProductController } from '../../controllers/ProductController';
import { productSchema } from '../../models/product.model';

export async function productRoutes(fastify: FastifyInstance) {
    const productController = new ProductController();

    fastify.post('/product/register',  { schema:productSchema },async (req:any, res:any) => {
        return productController.register(req, res);
    });

    fastify.delete('/product/:productId/:storeId', async (req: any, res: any) => {
        return productController.delete(req, res);
    });

    fastify.put('/product/update',  async (req: any, res: any) => {
        return productController.update(req, res);
    });

    fastify.get('/product/getAllByStore/:storeId', async (req: any, res: any) => {
        return productController.getAll(req, res);
    });

    fastify.get('/product/getByNameByStore/:storeId/:name', async (req: any, res: any) => {
        return productController.getByName(req, res);
    });
}