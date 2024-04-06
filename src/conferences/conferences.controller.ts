import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConferencesService } from './conferences.service';
import { Prisma } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('conferences')
export class ConferencesController {
  constructor(private readonly conferencesService: ConferencesService) {}

  @Get(':id')
  public async getConferenceById(@Param('id') id: string) {
    return this.conferencesService.getConferenceById(id);
  }

  @Get()
  public async getConferences() {
    return this.conferencesService.getConferences();
  }

  @Post()
  public async createConference(@Body() data: Prisma.ConferenceCreateInput) {
    return this.conferencesService.createConference(data);
  }

  @Post(':id/video')
  @UseInterceptors(FileInterceptor('file'))
  public async addVideoToConference(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.conferencesService.addVideoToConference(id, file);
  }
}
