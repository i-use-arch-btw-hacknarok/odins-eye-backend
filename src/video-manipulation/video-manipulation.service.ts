import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '@src/storage/storage.service';
import { createWriteStream } from 'fs';
import { mkdtemp, readFile } from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class VideoManipulationService {
  private readonly logger = new Logger(VideoManipulationService.name);
  constructor(private readonly storageService: StorageService) {}

  public async convertMp4ToMov(fileName: string) {
    const fileReadStrem = this.storageService.getFileReadStream(fileName);
    const temporaryDir = await mkdtemp('/tmp/');
    const temporaryFileName = `${temporaryDir}/${fileName}`;
    const fileWriteStream = createWriteStream(temporaryFileName);

    this.logger.log(`Downloading file ${fileName}`);
    await new Promise((resolve, reject) => {
      fileReadStrem.pipe(fileWriteStream);
      fileWriteStream.on('finish', () => {
        resolve(temporaryFileName);
      });
      fileWriteStream.on('error', (error) => {
        reject(error);
      });
    });

    this.logger.log(`Converting file ${fileName}`);

    const fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
    const outputFileName = `${fileNameWithoutExtension}.mov`;
    const outputFilePath = `${temporaryDir}/${outputFileName}`;

    await new Promise((resolve, reject) => {
      ffmpeg(temporaryFileName)
        .output(outputFilePath)
        .on('end', () => {
          resolve(outputFilePath);
        })
        .on('error', (error) => {
          reject(error);
        })
        .save(outputFilePath);
    });

    this.logger.log(`Uploading file ${outputFileName}`);

    const outputFile = await readFile(outputFilePath);
    const s3OutputFilePath = `${outputFileName}`;
    return await this.storageService.uploadBufferFile(outputFile, s3OutputFilePath);
  }
}
