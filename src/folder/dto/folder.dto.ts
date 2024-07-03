import { IsOptional } from 'class-validator';

export class FolderDto {
  folderName: string;
  ownerID: string;
  children: [];

  @IsOptional()
  folderID?: string;
}
