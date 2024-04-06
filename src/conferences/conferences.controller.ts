import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConferencesService } from './conferences.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConferenceCreateInput } from './conferences.dto';

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
  public async createConference(@Body() data: ConferenceCreateInput) {
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
