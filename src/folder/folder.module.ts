import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { FolderModel } from './folder.model';
import { ConfigModule } from '@nestjs/config';

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
    ConfigModule,
  ],
  controllers: [FolderController],
  providers: [FolderService],
})
export class FolderModule {}
