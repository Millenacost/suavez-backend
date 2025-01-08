import { FastifySchema } from "fastify";

export interface RelQueueEmployee {
    id: number;                 
    queueId: number;  
    userId: string; 
    registeringDate?: Date;        
}

export const relQueueEmployeeSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['queueId', 'userId'],
        properties: {
            queueId: { type: 'number' },
            userId: { type: 'number' },
            registeringDate: { type: 'string' },
        },
        additionalProperties: false, // Não permite propriedades adicionais
    },
};