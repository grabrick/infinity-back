import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;

  // @IsString()
  firstName: string;

  // @IsString()
  lastName: string;

  @MinLength(6, { message: 'Password cannot be less than 6 characters' })
  // @IsString()
  password: string;

  // @IsString()
  confirmPassword: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @MinLength(6, { message: 'Password cannot be less than 6 characters' })
  @IsString()
  password: string;
}
