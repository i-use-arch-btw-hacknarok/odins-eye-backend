import { Inject, Injectable } from '@nestjs/common';
import { AwsConfig, awsConfig } from '@src/config/aws.config';
import { DbService } from '@src/db/db.service';
import { S3 } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';

@Injectable()
export class StorageService {
  private readonly bucketName: string;

  constructor(
    @InjectAwsService(S3) private readonly s3Service: S3,
    @Inject(awsConfig.KEY) { bucketName }: AwsConfig,
    private readonly dbService: DbService,
  ) {
    this.bucketName = bucketName;
  }

  public async uploadFile(file: Express.Multer.File) {
    const randomFileName = `${Date.now()}-${file.originalname}`; // very good mock, 10/10, would use in production

    const uploadResult = await this.s3Service
      .upload({
        Bucket: this.bucketName,
        Key: randomFileName,
        Body: file.buffer,
      })
      .promise();

    return await this.dbService.file.create({
      data: {
        name: file.originalname,
        url: uploadResult.Location,
      },
    });
  }
}
