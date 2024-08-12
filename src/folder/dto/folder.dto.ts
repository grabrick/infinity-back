import { IsOptional } from 'class-validator';

export class FolderDto {
  folderName: string;
  ownerID: string;
  children: [];
  createdIn: string;

  @IsOptional()
  folderID?: string;
}
