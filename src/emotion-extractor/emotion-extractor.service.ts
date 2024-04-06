import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Video } from '@prisma/client';
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
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.bucketName = bucketName;
  }

  public async processVideo(videoId: string) {
    const rekoResponse = await this.sendVideoToRekognition(videoId);

    const emotionsWithTimestamps = rekoResponse.Faces?.flatMap(({ Face, Timestamp }) => {
      if (!Face || !Timestamp) {
        return [];
      }

      const { Emotions } = Face;

      if (!Emotions) {
        return [];
      }

      const validEmotions = Emotions.filter((emotion) => emotion.Confidence && emotion.Type);
      return validEmotions.map((emotion) => ({
        timestamp: Timestamp,
        type: emotion.Type,
        confidence: emotion.Confidence,
      }));
    });

    if (!emotionsWithTimestamps) {
      throw new Error('No emotions found');
    }

    const timestampsWithEmotionsAcc: Record<
      number,
      Array<{ emotion: string; confidence: number }>
    > = {};

    emotionsWithTimestamps.forEach(({ timestamp, type, confidence }) => {
      const timestampInSeconds = Math.floor(timestamp);
      if (!timestampsWithEmotionsAcc[timestampInSeconds]) {
        timestampsWithEmotionsAcc[timestampInSeconds] = [];
      }

      timestampsWithEmotionsAcc[timestampInSeconds].push({
        emotion: type!,
        confidence: confidence!,
      });
    });

    const FOCUSED_EMOTIONS = ['HAPPY', 'ANGRY', 'CONFUSED', 'DISGUSTED', 'SURPRISED'];
    const NOT_FOCUSED_EMOTIONS = ['CALM', 'SAD'];

    const timestampsWithEmotions = Object.entries(timestampsWithEmotionsAcc).map(
      ([timestamp, emotions]) => {
        const focusedEmotions = emotions.filter(({ emotion }) =>
          FOCUSED_EMOTIONS.includes(emotion),
        );
        const notFocusedEmotions = emotions.filter(({ emotion }) =>
          NOT_FOCUSED_EMOTIONS.includes(emotion),
        );

        const focusedEmotionsConfidence = focusedEmotions.reduce(
          (acc, { confidence }) => acc + confidence,
          0,
        );
        const notFocusedEmotionsConfidence = notFocusedEmotions.reduce(
          (acc, { confidence }) => acc + confidence,
          0,
        );

        const totalConfidence = focusedEmotionsConfidence + notFocusedEmotionsConfidence;
        const score = focusedEmotionsConfidence / totalConfidence;
        const percentage = score * 100;

        return {
          timestamp: Number(timestamp),
          focusedEmotion: percentage,
        };
      },
    );

    await Promise.all(
      timestampsWithEmotions.map(async ({ timestamp, focusedEmotion }) =>
        this.dbService.engagement.create({
          data: {
            timestamp,
            engagementPercentage: focusedEmotion,
            video: { connect: { id: videoId } },
          },
        }),
      ),
    );

    this.logger.log(`Emotions for video ${videoId} processed`);
    this.eventEmitter.emit('emotions.added', videoId);
  }

  private async sendVideoToRekognition(videoId: string) {
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
            Name: processedVideo.name,
          },
        },
        FaceAttributes: 'ALL',
      })
      .promise();

    const { JobId } = rekognitionResponse;
    if (!JobId) {
      throw new Error('Failed to start face detection job');
    }

    this.logger.log(`Face detection job for video ${videoId} started with job id ${JobId}`);

    const jobResult = await this.awaitJobCompletion(JobId);
    this.logger.log(`Face detection job for video ${videoId} completed`);

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

  @OnEvent('video.added')
  public async onVideoAdded(video: Video) {
    return await this.processVideo(video.id);
  }

  //   public async onApplicationBootstrap2() {
  //     this.processVideo('cluo9qiv6000312gpgcpeo1eu');
  //   }
}
