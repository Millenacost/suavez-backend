export interface User {
    id: number;                 
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
    status?: string;           
    email: string;             
    password: string;          
    active?: boolean;          
    profile?: string;          
    storeId?: number;          
    isvalid?: boolean;         
}