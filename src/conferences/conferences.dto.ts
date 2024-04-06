import { ApiProperty } from '@nestjs/swagger';

export class ConferenceCreateInput {
  @ApiProperty()
  topic!: string;
}
