import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DbService } from '@src/db/db.service';
import { StorageService } from '@src/storage/storage.service';
import { ID } from '@src/utils/globalTypes';

@Injectable()
export class ConferencesService {
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
    const fileModel = await this.storageService.uploadFile(file);
    return await this.dbService.video.create({
      data: {
        conferenceId,
        fileId: fileModel.id,
      },
    });
  }
}
