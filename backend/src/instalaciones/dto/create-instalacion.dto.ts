import { IsString, IsInt, IsBoolean, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateInstalacionDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  suscriptor?: string;

  @IsOptional()
  @IsInt()
  sector?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ident?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  dv?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombres?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  primer_apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  segundo_apellido?: string;

  @IsString()
  @MaxLength(255)
  nombre: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsInt()
  regimen?: number;

  @IsOptional()
  @IsInt()
  tipo_persona?: number;

  @IsOptional()
  @IsInt()
  tipo_impuesto?: number;

  @IsOptional()
  @IsInt()
  centro_costos?: number;

  @IsOptional()
  @IsBoolean()
  factura_fisica?: boolean;

  @IsOptional()
  @IsBoolean()
  enviar_factura_email?: boolean;

  @IsOptional()
  @IsBoolean()
  enviar_factura_whatsapp?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @IsOptional()
  @IsInt()
  ciudad_codigo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @IsOptional()
  @IsInt()
  estrato_codigo?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigo_medidor?: string;

  @IsOptional()
  @IsInt()
  marca_codigo?: number;

  @IsOptional()
  @IsInt()
  uso_codigo?: number;

  @IsOptional()
  @IsInt()
  lectura?: number;

  @IsOptional()
  @IsInt()
  promedio?: number;

  @IsOptional()
  @IsInt()
  lectura_anterior?: number;

  @IsInt()
  empresa_id: number;

  @IsOptional()
  @IsInt()
  prefijo?: number;

  @IsOptional()
  @IsInt()
  orden?: number;

  @IsOptional()
  @IsInt()
  cliente?: number;
}
