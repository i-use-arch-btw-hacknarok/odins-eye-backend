import { Injectable } from '@nestjs/common';
import { AwsService } from 'nest-aws-sdk';

@Injectable()
export class StorageService {
  constructor(private readonly awsService: AwsService) {}

  public async uploadFile(file: Express.Multer.File) {
    return this.awsService.upload(file);
  }
}
