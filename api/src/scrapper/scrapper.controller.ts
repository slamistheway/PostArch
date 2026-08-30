import {Controller, Get, Post, Body, Patch, Param, Delete, Logger, Query} from '@nestjs/common';
import { ScrapperService } from './scrapper.service';
import puppeteer from 'puppeteer';
import {In} from "typeorm";


@Controller('scrapper')
export class ScrapperController {
  constructor(
      private readonly scrapperService: ScrapperService
  ) {
  }

  /*------------------------------------READ------------------------------------*/
  @Get('posts')
  findPosts(@Query('pageType') pageType: string) {
    return this.scrapperService.findPosts(pageType);
  }



  @Get('comments')
  findComments(@Query('pageType') pageType: string) {
    return this.scrapperService.findComments(pageType);
  }

  @Get('lists')
  findLists() {
    return this.scrapperService.findLists();
  }

  @Get('all')
  findAll(@Query('pageType') pageType: string, @Query('listID') listID: string) {
    return this.scrapperService.findAll(pageType, listID);
  }

  @Get('pinned')
  findPinned() {
    return this.scrapperService.findPinned();
  }

  @Get('pinnedIDs')
  findPinnedIDs() {
    return this.scrapperService.findPinnedIDs();
  }


  @Get('postView/:id')
  findOnePost(@Param('id') id: string) {
    return this.scrapperService.findOnePost(id);
  }



  @Get('commentView/:id')
  findOneComment(@Param('id') id: string) {
    return this.scrapperService.findOneComment(id);
  }

  @Get('listView/:id')
  findOneList(@Param('id') id: string) {
    return this.scrapperService.findOneList(+id);
  }


  /*------------------------------------CREATE------------------------------------*/
  @Post('addSaveYTDLP')
  addSaveYTDLP(@Body('arg_URL') arg_URL: string) {
    return this.scrapperService.addSaveYTDLP(arg_URL);
  }

  @Post('saveHTMLToFile')
  saveHTMLToFile(@Body('arg_URL') arg_URL: string) {
    return this.scrapperService.saveHTMLToFile(arg_URL);
  }

  @Post('addSaveREDDIT')
  addSaveREDDIT(@Body('arg_URL') arg_URL: string) {
    return this.scrapperService.addSaveREDDIT(arg_URL);
  }

  @Post('createList')
  createList(@Body('arg_ListName') arg_ListName: string) {
    return this.scrapperService.createList(arg_ListName);
  }

  @Post('pinSave')
  pinSave(@Body('arg_SaveID') arg_SaveID: string, @Body('isPostOrComment') isPostOrComment: string) {
    return this.scrapperService.pinSave(arg_SaveID, isPostOrComment);
  }

  @Post('addSaveToList')
  addSaveToList(@Body('arg_ListID') arg_ListID: string, @Body('arg_SaveID') arg_SaveID: string, @Body('arg_postType') arg_postType: string) {
    return this.scrapperService.addSaveToList(arg_ListID, arg_SaveID, arg_postType);
  }

  @Delete('removeSaveFromList')
  removeSaveFromList(@Body('arg_ListID') arg_ListID: string, @Body('arg_SaveID') arg_SaveID: string, @Body('arg_postType') arg_postType: string) {
    return this.scrapperService.removeSaveFromList(arg_ListID, arg_SaveID, arg_postType);
  }


  @Post('loadAllPostsAndFetchTheirLists')
  loadAllPostsAndFetchTheirLists(@Body('arg_postIDs') arg_postIDs: string[]) {
    return this.scrapperService.loadAllPostsAndFetchTheirLists(arg_postIDs);
  }




  /*------------------------------------UPDATE------------------------------------*/


  /*------------------------------------DELETE------------------------------------*/
  @Delete('deleteSave')
  deleteSave(@Body('arg_SaveID') arg_SaveID: string, @Body('arg_saveType') arg_saveType: string, @Body('arg_withCommentsAlso') arg_withCommentsAlso: string) {
    return this.scrapperService.deleteSave(arg_SaveID, arg_saveType, arg_withCommentsAlso);
  }

  @Delete('deleteList/:arg_ListID')
  async deleteList(@Param('arg_ListID') arg_ListID: string): Promise<{ message: string }> {
    return this.scrapperService.deleteList(arg_ListID);
  }




}

