import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { DbService } from '@src/db/db.service';
import { StorageService } from '@src/storage/storage.service';
import { ID } from '@src/utils/globalTypes';

@Injectable()
export class ConferencesService {
  private readonly logger = new Logger(ConferencesService.name);
  constructor(
    private readonly dbService: DbService,
    private readonly storageService: StorageService,
    private eventEmitter: EventEmitter2,
  ) {}

  public async getConferences() {
    return this.dbService.conference.findMany();
  }

  public async getConferenceById(id: ID) {
    const result = await this.dbService.conference.findUnique({
      where: {
        id,
      },
      include: {
        Video: {
          include: {
            file: true,
            Transcription: true,
          },
        },
      },
    });

    if (!result) {
      throw new Error('Conference not found');
    }
  }

  public async createConference(data: Prisma.ConferenceCreateInput) {
    return this.dbService.conference.create({
      data,
    });
  }

  public async updateConference(id: ID, data: Prisma.ConferenceUpdateInput) {
    return this.dbService.conference.update({
      where: {
        id,
      },
      data,
    });
  }

  public async addVideoToConference(conferenceId: ID, file: Express.Multer.File) {
    this.logger.log(`Adding video to conference ${conferenceId}`);
    const fileModel = await this.storageService.uploadMulterFile(file);

    this.logger.log(`Creating video record for file ${fileModel.id}`);
    const video = await this.dbService.video.create({
      data: {
        file: { connect: { id: fileModel.id } },
      },
    });

    await this.dbService.conference.update({
      where: {
        id: conferenceId,
      },
      data: {
        Video: {
          connect: {
            id: video.id,
          },
        },
      },
    });

    this.eventEmitter.emit('video.added', video);

    return video;
  }
}
