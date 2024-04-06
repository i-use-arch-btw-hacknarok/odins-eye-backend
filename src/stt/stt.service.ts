import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Video } from '@prisma/client';
import { awsConfig, AwsConfig } from '@src/config/aws.config';
import { DbService } from '@src/db/db.service';
import { StorageService } from '@src/storage/storage.service';
import { TranscribeService } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name);
  private readonly bucketName: string;

  constructor(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    @InjectAwsService(TranscribeService) private readonly transcribeService: TranscribeService,
    private readonly dbService: DbService,
    private readonly storageService: StorageService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(awsConfig.KEY) { bucketName }: AwsConfig,
  ) {
    this.bucketName = bucketName;
  }

  @OnEvent('video.added')
  public async onVideoAdded(video: Video) {
    return await this.processVideo(video.id);
  }

  public async processVideo(videoId: string) {
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

    this.logger.log(`Processing video ${video.id}`);

    const transcribeJobName = `${video.file.name}-transcription`;

    await this.transcribeService
      .startTranscriptionJob({
        TranscriptionJobName: transcribeJobName,
        OutputBucketName: this.bucketName,
        MediaFormat: 'mp4',
        Media: {
          MediaFileUri: video.file.url,
        },
        LanguageCode: 'pl-PL',
      })
      .promise();

    const transcriptionResponse = await this.awaitJobCompletion(transcribeJobName);

    this.logger.log(`Transcription job completed for video ${video.id}`);

    const transcriptionUrl = transcriptionResponse.TranscriptionJob?.Transcript?.TranscriptFileUri;
    if (!transcriptionUrl) {
      throw new Error('Transcription not found');
    }

    const transcriptionJsonName = `${transcribeJobName}.json`;
    const transcriptionFileStream = this.storageService.getFileReadStream(transcriptionJsonName);
    // convert stream to buffer
    const transcriptionJsonBuffer = await new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      transcriptionFileStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      transcriptionFileStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    const transcription = JSON.parse(transcriptionJsonBuffer.toString());

    this.logger.log(`Transcription for video ${video.id} completed`);

    await this.processTranscription(transcription, video.id);

    return transcription;
  }

  private async processTranscription(transcription: any, videoId: string) {
    const results = transcription.results.items;
    const words = results.filter((item: any) => item.type === 'pronunciation');

    const textWithEndTimes = words.reduce((acc: any, word: any) => {
      const { end_time, alternatives } = word;
      const wordText = alternatives[0].content;

      if (!acc[end_time]) {
        acc[end_time] = [];
      }

      acc[end_time].push(wordText);

      return acc;
    }, {});

    await Promise.all(
      Object.entries(textWithEndTimes).map(async (item) => {
        const [endTime, words] = item;
        const text = (<any>words).join(' ');

        await this.dbService.transcription.create({
          data: {
            text,
            videoId,
            endTime: parseFloat(endTime) * 1000,
          },
        });
      }),
    );

    this.logger.log(`Transcription for video ${videoId} processed`);
    this.eventEmitter.emit('transcription.added', videoId);
  }

  private async awaitJobCompletion(jobName: string) {
    while (true) {
      this.logger.verbose(`Checking job ${jobName}`);
      const jobResult = await this.transcribeService
        .getTranscriptionJob({ TranscriptionJobName: jobName })
        .promise();
      if (jobResult.TranscriptionJob?.TranscriptionJobStatus === 'COMPLETED') {
        return jobResult;
      }

      if (jobResult.TranscriptionJob?.TranscriptionJobStatus === 'FAILED') {
        this.logger.error('Transcription job failed');
        this.logger.error(JSON.stringify(jobResult, null, 2));
        throw new Error('Transcription job failed');
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
