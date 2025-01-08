import { FastifySchema } from "fastify";

export interface Queue {
    id: number;                 
    storeId: number;  
    name: string;
    description: string;
    registeringDate?: Date;
    lastUpDate?: Date;
    status?: StatusQueueEnum;
}

export enum StatusQueueEnum {
    Open = 'open',
    Closed = 'closed',
    Waiting = 'waiting',
    InService = 'in_service',
    OnHold = 'on_hold'
}

export const queueSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['storeId', 'name', 'description', 'status'],
        properties: {
            storeId: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            registeringDate: { type: 'string' },
            lastUpDate: {type: 'string'}
        },
        additionalProperties: false, // Não permite propriedades adicionais
    },
};