import { FastifySchema } from "fastify";

export interface RelStoreEmployee {
    id: string;
    storeId: string;
    userId: string;
}

export const relStoreEmployeeSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['storeId', 'userId'],
        properties: {
            id: { type: 'string' },
            storeId: { type: 'string' },
            userId: { type: 'string' },
        },
        additionalProperties: false,
    },
};