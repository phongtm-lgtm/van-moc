export type ProductForm={categoryId:string;code:string;slug:string;name:string;shortDescription:string;description:string;material:string;price:number;active:boolean;engravingEnabled:boolean;engravingMaxChars:number|null;engravingFee:number;fonts:string[];positions:{position:string;maxChars:number|null}[];version:number}
export type ProductImage={id:string;url:string;altText:string|null;primary:boolean;displayOrder:number;mediaType?:'IMAGE'|'VIDEO'}
export type Product={id:string;stock:number;details:ProductForm;images:ProductImage[]}
export type Page<T>={content:T[];totalPages:number;totalElements:number}
export type Movement={id:string;delta:number;reason:string;note:string|null;orderId:string|null;changedByUserId:string|null;createdAt:string}
export const blankProduct:ProductForm={categoryId:'',code:'',slug:'',name:'',shortDescription:'',description:'',material:'',price:0,active:true,engravingEnabled:false,engravingMaxChars:30,engravingFee:0,fonts:[],positions:[],version:0}
