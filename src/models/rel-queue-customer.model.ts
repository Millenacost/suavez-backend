import { FastifySchema } from "fastify";

export interface RelQueueCustomer {
    id: string;
    queueId: string;
    userId: string;
    entryDateQueue?: Date, 
    exitDateQueue?: Date, 
    initAttendDate?: Date, 
    exitAttendDate?: Date,
    status: StatusCustomerEnum;
}

export const relQueueCustomerSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['queueId', 'userId', 'entryDate', 'status'],
        properties: {
            queueId: { type: 'string' },
            userId: { type: 'string' },
            entryDateQueue: { type: 'string', format: 'date-time' },
            exitDateQueue: { type: 'string', format: 'date-time' },
            initAttendDate: { type: 'string', format: 'date-time' },
            exitAttendDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
        },
        additionalProperties: false,
    },
};

export enum StatusCustomerEnum {
    WAITING = 'WAITING',
    ATTENDED = 'ATTENDED',
    LEFT = 'LEFT',
    CANCELLED = 'CANCELLED'
}