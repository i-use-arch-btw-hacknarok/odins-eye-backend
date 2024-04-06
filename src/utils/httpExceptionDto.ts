import { ApiProperty } from '@nestjs/swagger';

export class HttpExceptionDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
  })
  statusCode!: number;

  @ApiProperty({
    example: 'Bad Request',
    description: 'HTTP status message',
  })
  message!: string;

  @ApiProperty({
    example: 'Invalid email',
    description: 'Error message',
  })
  error!: string;
}

export class UnauthorizedExceptionDto {
  @ApiProperty({
    example: 401,
    description: 'HTTP status code',
  })
  statusCode!: number;

  @ApiProperty({
    example: 'Unauthorized',
    description: 'HTTP status message',
  })
  message!: string;

  @ApiProperty({
    example: 'Invalid credentials',
    description: 'Error message',
  })
  error!: string;
}
