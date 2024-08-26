import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { FolderModel } from './folder.model';
import { ConfigModule } from '@nestjs/config';
import { LessonModel } from 'src/lesson/lesson.model';
import { MyResultsModel } from 'src/my-results/my-results.model';

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
        typegooseClass: MyResultsModel,
        schemaOptions: {
          collection: 'SharedLesson',
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
  controllers: [FolderController],
  providers: [FolderService],
})
export class FolderModule {}
