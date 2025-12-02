export class CreateUserDto {
  empresaId: number;
  roleId: number;
  name: string;
  email: string;
  phone?: string;
  password: string;
  active?: boolean;
}
