import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConferencesService } from './conferences.service';
import { Prisma } from '@prisma/client';

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
}
