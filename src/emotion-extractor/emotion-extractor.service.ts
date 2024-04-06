import { Inject, Injectable, Logger } from '@nestjs/common';
import { AwsConfig, awsConfig } from '@src/config/aws.config';
import { DbService } from '@src/db/db.service';
import { VideoManipulationService } from '@src/video-manipulation/video-manipulation.service';
import { Rekognition } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';

@Injectable()
export class EmotionExtractorService {
  private readonly logger = new Logger(EmotionExtractorService.name);
  private readonly bucketName: string;
  constructor(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    @InjectAwsService(Rekognition) private readonly rekognition: Rekognition,
    private readonly dbService: DbService,
    @Inject(awsConfig.KEY) { bucketName }: AwsConfig,
    private readonly videoManipulationService: VideoManipulationService,
  ) {
    this.bucketName = bucketName;
  }

  public async processVideo(videoId: string) {
    this.logger.log(`Processing video ${videoId}`);
    const video = await this.dbService.video.findUnique({
      where: {
        id: videoId,
      },
      include: {
        file: true,
      },
    });

    if (!video) {
      throw new Error('Video not found');
    }

    const processedVideo = await this.videoManipulationService.convertMp4ToMov(video.file.name);
    this.logger.log(`Processed video ${videoId}`);

    this.logger.log(`Starting face detection for video ${videoId} (${processedVideo.url})`);

    const rekognitionResponse = await this.rekognition
      .startFaceDetection({
        Video: {
          S3Object: {
            Bucket: this.bucketName,
            Name: processedVideo.url,
          },
        },
      })
      .promise();

    const { JobId } = rekognitionResponse;
    if (!JobId) {
      throw new Error('Failed to start face detection job');
    }

    this.logger.log(`Face detection job for video ${videoId} started with job id ${JobId}`);

    const jobResult = await this.awaitJobCompletion(JobId);
    this.logger.log(`Face detection job for video ${videoId} completed`);

    this.logger.log(JSON.stringify(jobResult, null, 2));
    return jobResult;
  }

  private async awaitJobCompletion(jobId: string) {
    while (true) {
      this.logger.verbose(`Checking job ${jobId}`);
      const jobResult = await this.rekognition.getFaceDetection({ JobId: jobId }).promise();
      if (jobResult.JobStatus === 'SUCCEEDED') {
        return jobResult;
      }

      if (jobResult.JobStatus === 'FAILED') {
        this.logger.error('Face detection job failed');
        this.logger.error(JSON.stringify(jobResult, null, 2));
        throw new Error('Face detection job failed');
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  public async onApplicationBootstrap() {
    this.processVideo('cluo9qiv6000312gpgcpeo1eu');
  }
}
