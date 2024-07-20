import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { ConfigModule } from '@nestjs/config';
import { LessonModel } from './lesson.model';
import { TypegooseModule } from 'nestjs-typegoose';
import { FolderModel } from 'src/folder/folder.model';

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: LessonModel,
        schemaOptions: {
          collection: 'Lesson',
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
    ConfigModule,
  ],
  controllers: [LessonController],
  providers: [LessonService],
})
export class LessonModule {}
