import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database.module';
import { ScrapperModule } from './scrapper/scrapper.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
      DatabaseModule,
      ScrapperModule,
        ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', 'public')
      }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}



