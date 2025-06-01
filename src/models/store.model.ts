import { FastifySchema } from "fastify";

export interface Store {
    id: string;                 
    ownerId: string;  
    name: string;
    description: string;
    registeringDate?: Date;
    lastUpDate?: Date;
    phone?: string;            
    street?: string;           
    number?: string;           
    city?: string;            
    state?: string;            
    logoPath?: string;
    backgrounding?: string;
    status?: StatusStoreEnum;             
}

export enum StatusStoreEnum {
    Open = 'open',
    Closed = 'closed'
}

export const storeSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['ownerId', 'name', 'description'], 
        properties: {
            ownerId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            registeringDate: { type: 'string', nullable: true },
            lastUpDate: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            street: { type: 'string', nullable: true },
            number: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            state: { type: 'string', nullable: true },
            logoPath: { type: 'string', nullable: true },
            backgrounding: { type: 'string', nullable: true },
            status: { type: 'string', nullable: true },
        },
        additionalProperties: false,
    },
};