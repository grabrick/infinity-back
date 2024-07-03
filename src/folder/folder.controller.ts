import { Controller, Post, Body, Put, Get, Param } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderDto } from './dto/folder.dto';

@Controller('folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post('/create')
  createFolder(@Body() folderDto: FolderDto) {
    return this.folderService.createNewFolder(folderDto);
  }

  @Get(':id')
  getCurrentFolder(@Param('id') _id: string) {
    return this.folderService.getCurrentFolder(_id);
  }

  @Get(':id/children')
  async getFolderChildren(@Param('id') id: string) {
    return this.folderService.getChildrenFolders(id);
  }

  @Put('/delete')
  deleteFolder(@Body() body: { foldersID: string | string[] }) {
    return this.folderService.deleteFolders(body);
  }

  @Post('/move')
  moveInFolder(@Body() data: any) {
    return this.folderService.moveEntityInFolder(data);
  }
}
