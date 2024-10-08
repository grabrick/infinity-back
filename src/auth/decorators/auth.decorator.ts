import { UseGuards, applyDecorators } from '@nestjs/common';
import { TypeRole } from '../auth.interface';
import { OnlyAdminGuard } from '../guards/admin.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';

export function Auth(role: TypeRole = 'student') {
  return applyDecorators(
    role === 'teacher'
      ? UseGuards(JwtAuthGuard, OnlyAdminGuard)
      : UseGuards(JwtAuthGuard),
  );
}
