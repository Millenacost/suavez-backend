export interface Store {
    id: number;                 
    ownerId: number;  
    name: string;
    description: string;
    registeringDate?: Date;
    lastUpDate?: Date;
    phone?: string;            
    street?: string;           
    number?: string;           
    city?: string;            
    state?: string;            
    logo?: string;
    backgrounding?: string;
    status?: string;             
}