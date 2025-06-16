import { FastifySchema } from "fastify";

export interface User {
    id: string;                 
    name: string;              
    lastName: string;          
    registeringDate: Date;     
    lastupDate?: Date;         
    phone?: string;            
    address?: string;           
    number?: string;           
    cpf: string;               
    city?: string;            
    stateId?: string;            
    email: string;             
    password: string;          
    active?: boolean;          
    profile?: number;          
    ddd?: string;     
    profileImage?: File;
    imageUrl?: string;
    acceptAwaysMinorQueue?: boolean;
    deleteAccount?: boolean; 
    RemoveProfileImage?: boolean;
}

export const userSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['name', 'cpf', 'email', 'password'],
        properties: {
            id: { type: 'string', nullable: true },
            name: { type: 'string' },
            lastName: { type: 'string' },
            registeringDate: { type: 'string', nullable: true },
            lastUpDate: { type: 'string', nullable: true },
            cpf: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            phone: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            number: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            stateId: { type: 'string', nullable: true },
            active: { type: 'boolean', nullable: true },
            profile: { type: 'number', nullable: true },
            ddd: { type: 'string', nullable: true },
            profileImage: { type: 'string', nullable: true },
            acceptAwaysMinorQueue: { type: 'boolean', nullable: true },
            imageUrl: { type: 'string', nullable: true },
            deleteAccount: { type: 'boolean', nullable: true }, 
            RemoveProfileImage: { type: 'boolean', nullable: true }, 
        },
        additionalProperties: false,
    },
};