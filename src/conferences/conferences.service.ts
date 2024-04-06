import { Injectable, Logger } from '@nestjs/common';
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
  ) {}

  public async getConferences() {
    return this.dbService.conference.findMany();
  }

  public async getConferenceById(id: ID) {
    return this.dbService.conference.findUnique({
      where: {
        id,
      },
    });
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
    const path = '/raw-videos';
    const fileModel = await this.storageService.uploadMulterFile(file, path);

    this.logger.log(`Creating video record for file ${fileModel.id}`);
    return await this.dbService.video.create({
      data: {
        file: { connect: { id: fileModel.id } },
        conference: { connect: { id: conferenceId } },
      },
    });
  }
}
