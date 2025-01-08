import { FastifySchema } from "fastify";

export interface RelQueueEmployee {
    id: string;                 
    queueId: string;  
    userId: string; 
    registeringDate?: Date;        
}

export const relQueueEmployeeSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['queueId', 'userId'],
        properties: {
            queueId: { type: 'string' },
            userId: { type: 'string' },
            registeringDate: { type: 'string' },
        },
        additionalProperties: false, // Não permite propriedades adicionais
    },
};