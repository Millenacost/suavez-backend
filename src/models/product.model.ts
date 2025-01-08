import { FastifySchema } from "fastify";

export interface Product {
    id: string;                 
    storeId: string;  
    name: string;
    description: string;
    price: number;
    productType: string;            
}

export const productSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['storeId', 'name', 'description', 'price', 'productType'],
        properties: {
            storeId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            productType: { type: 'string' }
        },
        additionalProperties: false, // Não permite propriedades adicionais
    },
};