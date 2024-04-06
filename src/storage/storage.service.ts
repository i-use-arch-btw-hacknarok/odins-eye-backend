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

  public async uploadMulterFile(file: Express.Multer.File, path: string) {
    const randomFileName = `${Date.now()}-${file.originalname}`; // very good mock, 10/10, would use in production
    const randomFilePath = `${path}/${randomFileName}`;

    this.logger.log(`Uploading file ${randomFileName}`);

    let uploadResult: S3.ManagedUpload.SendData;

    try {
      uploadResult = await this.s3Service
        .upload({
          Bucket: this.bucketName,
          Key: randomFilePath,
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

  public async uploadBufferFile(file: Buffer, path: string) {
    this.logger.log(`Uploading buffer file to path ${path}`);

    let uploadResult: S3.ManagedUpload.SendData;
    try {
      uploadResult = await this.s3Service
        .upload({
          Bucket: this.bucketName,
          Key: path,
          Body: file,
        })
        .promise();
    } catch (error) {
      this.logger.error('Failed to upload file');
      this.logger.error(error);
      throw new UnprocessableEntityException('Failed to upload file');
    }

    return await this.dbService.file.create({
      data: {
        name: path,
        url: uploadResult.Location,
      },
    });
  }

  public async getFile(path: string) {
    this.logger.log(`Getting file from path ${path}`);
    return await this.s3Service
      .getObject({
        Bucket: this.bucketName,
        Key: path,
      })
      .promise();
  }

  public getFileReadStream(path: string) {
    this.logger.log(`Getting file read stream from path ${path}`);
    return this.s3Service.getObject({ Bucket: this.bucketName, Key: path }).createReadStream();
  }
}
