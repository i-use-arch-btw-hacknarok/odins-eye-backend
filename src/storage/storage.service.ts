import { Inject, Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { AwsConfig, awsConfig } from '@src/config/aws.config';
import { DbService } from '@src/db/db.service';
import { S3 } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';

@Injectable()
export class StorageService {
  private readonly bucketName: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    @InjectAwsService(S3) private readonly s3Service: S3,
    @Inject(awsConfig.KEY) { bucketName }: AwsConfig,
    private readonly dbService: DbService,
  ) {
    this.bucketName = bucketName;
  }

  public async uploadFile(file: Express.Multer.File) {
    const randomFileName = `${Date.now()}-${file.originalname}`; // very good mock, 10/10, would use in production

    this.logger.log(`Uploading file ${randomFileName}`);

    let uploadResult: S3.ManagedUpload.SendData;

    try {
      uploadResult = await this.s3Service
        .upload({
          Bucket: this.bucketName,
          Key: randomFileName,
          Body: file.buffer,
        })
        .promise();
    } catch (error) {
      this.logger.error('Failed to upload file');
      this.logger.error(error);
      throw new UnprocessableEntityException('Failed to upload file');
    }
    return await this.dbService.file.create({
      data: {
        name: randomFileName,
        url: uploadResult.Location,
      },
    });
  }
}
