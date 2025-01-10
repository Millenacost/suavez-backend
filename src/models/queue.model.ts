import { FastifySchema } from "fastify";
import { Service } from "./service.model";

export interface Queue {
    id: string;                 
    storeId: string;  
    name: string;
    description: string;
    registeringDate?: Date;
    lastUpDate?: Date;
    status?: StatusQueueEnum;
    employeeId?: string;
    services: string[];
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
            storeId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            registeringDate: { type: 'string' },
            lastUpDate: {type: 'string'},
            employeeId: {type: 'string'},
            services: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false, // Não permite propriedades adicionais
    },
};