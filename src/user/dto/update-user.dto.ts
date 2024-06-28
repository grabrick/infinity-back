import { IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  email: string;

  firstName?: string;
  lastName?: string;
  role?: string;
  password?: string;
  currentPassword?: string;
}
