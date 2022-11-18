export class Usuario{

    public id:number;
    public marca:string;
    public  precio:number;
    public  path_foto:string;

    



    public constructor(id:number=0, marca:string="", precio:number=0, path_foto:string=""){
        this.id = id;
        this.marca = marca;
        this.precio = precio;
        this.path_foto = path_foto;

    }

    
    
  /*  
    public ToString():string{
        return '{"patente":"'+this.patente+'","marca":"'+this.marca+'","color":"'+this.color+', "precio":' + this.precio + '}';
    }
    */
}