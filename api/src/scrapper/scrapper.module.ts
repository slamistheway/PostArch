import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScrapperService } from './scrapper.service';
import { ScrapperController } from './scrapper.controller';
import {Post, Comment, List, PostInList, ComemntInList, Pinned} from './entities/scrapper.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, List, PostInList, ComemntInList, Pinned])],
  controllers: [ScrapperController],
  providers: [ScrapperService],

})
export class ScrapperModule {}
