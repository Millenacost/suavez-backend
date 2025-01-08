import { profile } from "console";
import { FastifySchema } from "fastify";

export interface User {
    id: string;                 
    name: string;              
    lastName: string;          
    registeringDate: Date;     
    lastupDate?: Date;         
    phone?: string;            
    street?: string;           
    number?: string;           
    cpf: string;               
    city?: string;            
    state?: string;            
    email: string;             
    password: string;          
    active?: boolean;          
    profile?: string;          
    isvalid?: boolean;         
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
            street: { type: 'string', nullable: true },
            number: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            state: { type: 'string', nullable: true },
            isValid: { type: 'boolean', nullable: true },
            active: { type: 'boolean', nullable: true },
            profile: { type: 'string', nullable: true },

        },
        additionalProperties: false, // Não permite propriedades adicionais
    },
};