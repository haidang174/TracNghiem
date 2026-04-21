//src/modules/questions/questions.controller.ts

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsService } from './questions.service';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  async create(@CurrentUser() user: any, @Body() dto: CreateQuestionDto) {
    const question = await this.questionsService.create(dto);
    return {
      statusCode: 200,
      message: 'Tạo câu hỏi thành công',
      question,
    };
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  async findAll() {
    const questions = await this.questionsService.findAll();
    return {
      statusCode: 200,
      message: 'Lấy danh sách câu hỏi thành công',
      data: questions,
    };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findOne(@Param('id') id: number) {
    const question = await this.questionsService.findOne(id);
    return {
      statusCode: 200,
      message: 'Lấy câu hỏi thành công',
      question,
    };
  }

  async update(@Param('id') id: number, @Body() dto: CreateQuestionDto) {
    const question = await this.questionsService.update(id, dto);
    return {
      statusCode: 200,
      message: 'Cập nhật câu hỏi thành công',
      question,
    };
  }

  async remove(@Param('id') id: number) {
    await this.questionsService.remove(id);
    return {
      statusCode: 200,
      message: 'Xóa câu hỏi thành công',
      data: null,
    };
  }

  @Get('subjects/:id/answers')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findBySubject(@Param('id') id: number) {
    const subject = await this.questionsService.findByIdAnswerForQuestions(id);
    return {
      statusCode: 200,
      message: 'Lấy câu hỏi theo môn học thành công',
      subject,
    };
  }
}
