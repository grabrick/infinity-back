import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { UserModel } from './user.model';
import { ConfigModule } from '@nestjs/config';
import { FolderModel } from 'src/folder/folder.model';
import { LessonModel } from 'src/lesson/lesson.model';

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: UserModel,
        schemaOptions: {
          collection: 'User',
        },
      },
    ]),
    TypegooseModule.forFeature([
      {
        typegooseClass: FolderModel,
        schemaOptions: {
          collection: 'Folder',
        },
      },
    ]),
    TypegooseModule.forFeature([
      {
        typegooseClass: LessonModel,
        schemaOptions: {
          collection: 'Lesson',
        },
      },
    ]),
    ConfigModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
