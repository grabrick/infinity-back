import { Module } from '@nestjs/common';
import { MyResultsService } from './my-results.service';
import { MyResultsController } from './my-results.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { FolderModel } from 'src/folder/folder.model';
import { LessonModel } from 'src/lesson/lesson.model';
import { ConfigModule } from '@nestjs/config';
import { MyResultsModel } from './my-results.model';

@Module({
  imports: [
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
    TypegooseModule.forFeature([
      {
        typegooseClass: MyResultsModel,
        schemaOptions: {
          collection: 'SharedLesson',
        },
      },
    ]),
    ConfigModule,
  ],
  controllers: [MyResultsController],
  providers: [MyResultsService],
})
export class MyResultsModule {}
