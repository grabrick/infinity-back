import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { IdValidationPipe } from 'src/pipes/id.validation.pipes';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  // @Auth('teacher')
  async getUser(@Param('id', IdValidationPipe) id: string) {
    return this.userService.byId(id);
  }

  @Put('/:id/edit-profile')
  async editProfile(
    @Param('id', IdValidationPipe) id: string,
    @Body() data: any,
  ) {
    return this.userService.editProfile(id, data);
  }

  @Delete(':id')
  @HttpCode(200)
  @Auth('teacher')
  async deleteUser(@Param('id', IdValidationPipe) _id: string) {
    return this.userService.delete(_id);
  }
}
