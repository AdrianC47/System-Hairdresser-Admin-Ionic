import { Perfil } from "../Perfil.enum";
 
export class User{
    id?:string;
    username: string = '';
    password: string = '';  
    foto:string='';
    nombre : string='';
    cedula : string='';
    telefono:string='';
    perfil:Perfil;
}