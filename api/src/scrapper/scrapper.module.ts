import { Module } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';
import { ScrapperController } from './scrapper.controller';
import { DrizzleModule } from '../db/drizzle/drizzle.module';
import {NodePgDatabase} from "drizzle-orm/node-postgres";


@Module({
  imports: [DrizzleModule],
  providers: [ScrapperService],
  controllers: [ScrapperController],
})
export class ScrapperModule {}