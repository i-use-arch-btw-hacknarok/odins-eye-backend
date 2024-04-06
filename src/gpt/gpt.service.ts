import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GptConfig, gptConfig } from '@src/config/gpt.config';
import { DbService } from '@src/db/db.service';
import OpenAI from 'openai';

@Injectable()
export class GptService {
  private readonly openapi: OpenAI;
  private readonly logger = new Logger(GptService.name);
  constructor(
    @Inject(gptConfig.KEY) { apiKey }: GptConfig,
    private readonly dbService: DbService,
  ) {
    this.openapi = new OpenAI({ apiKey });
  }

  @OnEvent('transcription.added')
  public async generateTags(videoId: string) {
    const transcriptions = await this.dbService.transcription.findMany({
      where: {
        videoId,
      },
    });

    if (!transcriptions) {
      throw new Error('No transcriptions found');
    }

    const sortedTranscriptions = transcriptions.sort((a, b) => a.endTime - b.endTime);
    const fullText = sortedTranscriptions.map(({ text }) => text).join(' ');

    this.logger.log(`Generating tags for video ${videoId}`);

    const propmpt = `Generate tags for transcription of a conference.
    There should be between 5 and 10 tags.
    Tags should be separated by a comma.
    Tags should be useful for categorizing the content of the conference.
    Tags should improve the searchability of the conference.
    Tags should be relevant to the content of the conference.
    Tags should be in the same language as the original text.

    Example:
    Input:
      To jest konferencja o programowaniu w języku Python. Na konferencji mówiono o frameworku Django.

    Output:
      #Python, #Django, #programowanie, #konferencja, #framework

    This is the text of the conference:
    ${fullText}

    Tags:`;
    const completion = await this.createCompletion(propmpt);

    if (!completion) {
      throw new Error('Failed to generate tags');
    }

    this.logger.log(`Tags for video ${videoId} generated`);

    await this.dbService.conference.updateMany({
      where: {
        videoId,
      },
      data: {
        tags: completion,
      },
    });
  }

  @OnEvent('emotions.added')
  @OnEvent('transcription.added')
  public async getConferenceImprovementProposal(videoId: string) {
    const video = await this.dbService.video.findUnique({
      where: {
        id: videoId,
      },
      include: {
        Engagement: true,
        Transcription: true,
      },
    });

    const engagement = video?.Engagement;
    const transcriptions = video?.Transcription;

    if (!engagement || !transcriptions) {
      throw new Error('No engagement or transcriptions found');
    }

    if (engagement.length === 0 || transcriptions.length === 0) {
      throw new Error('No engagement or transcriptions found');
    }

    this.logger.log(`Creating proposal for video ${videoId}`);

    const prompt = `
      Create a conference improvement proposal based on the following data:

        Engagement:
        Engagement is represented in percentage and has timestamps.
        Higher engagement means that the audience is more interested in the content
${engagement
  .sort((a, b) => a.timestamp - b.timestamp)
  .map(({ timestamp, engagementPercentage }) => `${timestamp}: ${engagementPercentage}`)
  .join('\n')}

        Transcriptions:
        Transcriptions are the text representation of the spoken content. They have timestamps.
        The text is the actual content of the conference.
${transcriptions
  .sort((a, b) => a.endTime - b.endTime)
  .map(({ endTime, text }) => `${endTime}: ${text}`)
  .join('\n')}

        Do your best to create a proposal that will improve the conference based on the data provided.
        The proposal should consist of following format in JSON:
        [{
          "timestamp": 00000, // timestamp in seconds
          "proposal": "Your proposal here"
        },
        {
            "timestamp": 001000,
            "proposal": "Your other propsal here"
        }]

        The timestamps must exactly match the timestamps from transcriptions data. They don't have to match engagement timestamps.
        The proposal should have similar meaning to the original text, but it does not have to be an exact copy.
        The proposal should match the context of the conference and be relevant to the audience.
        The proposal must be in the same language as the original text.
        You can create proposals only to the timestamps that have lower engagement.

        Example:
          Input:
          5639: demo
          5920: będzie
          6559: potem
          6679: się
          7400: wyświetlało
          7679: mówcie
          7840: też
          8109: coś

          Engagement:
          4500: 7.189478990341882
          4999: 3.927343418151492
          5499: 0.4746652041461465
          5999: 6.204087545945016
          6499: 15.65284716643396
          6999: 33.54447321727923
          7499: 7.125391806382761
          7999: 12.28215099051809


        Output:
          5639: demonstracja
          5920: będzie
          6559: potem
          6679: się
          7400: pokazywała

        Proposal:`;

    const completion = await this.createCompletion(prompt);

    this.logger.log(`Proposal for video ${videoId} created`);

    if (!completion) {
      throw new Error('Failed to generate proposal');
    }

    const completionProposalJson = JSON.parse(completion);
    await Promise.all(
      completionProposalJson.map(async ({ timestamp, proposal }: any) => {
        await this.dbService.proposal.create({
          data: {
            timestamp: +timestamp,
            text: proposal,
            video: { connect: { id: videoId } },
          },
        });
      }),
    );

    return completionProposalJson;
  }

  private async createCompletion(prompt: string) {
    const completion = await this.openapi.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: [{ role: 'system', content: prompt }],
    });

    return completion.choices[0].message.content;
  }
}
