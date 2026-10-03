import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngestService } from './ingest.service.js';
import * as multer from 'multer';

@Controller('send')
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async ingestData(
    @UploadedFile() file?: Express.Multer.File,
    @Body('text') text?: string,
    @Body('source') source?: string,
  ) {
    if (!file && !text) {
      throw new BadRequestException('Either a file or text must be provided');
    }

    const results = [];

    // Agar text aaya hai, toh pehle usko save karo
    if (text) {
      const sourceName = source || 'raw-text-input';
      const textResult = await this.ingestService.processAndIngestText(
        text,
        sourceName,
      );
      results.push({ type: 'text', result: textResult });
    }

    // Agar file aayi hai, toh usko process karo
    if (file) {
      let fileText = '';
      if (file.originalname.toLowerCase().endsWith('.pdf')) {
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: file.buffer });
        const textResult = await parser.getText();
        fileText = textResult.text;
      } else {
        fileText = file.buffer.toString('utf8');
      }

      const fileResult = await this.ingestService.processAndIngestText(
        fileText,
        file.originalname,
      );
      results.push({ type: 'file', result: fileResult });
    }

    return { success: true, ingested: results };
  }
}
