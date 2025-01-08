import { FastifySchema } from "fastify";

export interface Service {
    id: number,
    storeId: number,
    name: string,
    description: string,
    price: number,
    serviceType: string,
    estimateTime: number
}

export const serviceSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['storeId', 'name', 'description', 'price', 'serviceType', 'estimateTime'],
        properties: {
            storeId: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            serviceType: { type: 'string' },
            estimateTime: {type: 'number'}
        },
        additionalProperties: false, // Não permite propriedades adicionais
    },
};
