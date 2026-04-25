//src/modules/questions/questions.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  async findAll(
    @Query('subject_id') subject_id?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const id = subject_id ? parseInt(subject_id) : undefined;
    const result = await this.questionsService.findAll(
      id,
      search,
      +page,
      +limit,
    );
    return new ApiResponse(200, 'Lấy danh sách câu hỏi thành công', {
      data: result.data,
      total: result.total,
      page: +page,
      limit: +limit,
    });
  }

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  async create(
    @Body() dto: CreateQuestionDto,
    @CurrentUser('id') user_id: number,
  ) {
    const question = await this.questionsService.create(dto, user_id);
    return new ApiResponse(200, 'Tạo câu hỏi thành công', question);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const question = await this.questionsService.findOne(id);
    return new ApiResponse(200, 'Lấy câu hỏi thành công', question);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateQuestionDto>,
    @CurrentUser('id') user_id: number,
  ) {
    const question = await this.questionsService.update(id, dto, user_id);
    return new ApiResponse(200, 'Cập nhật câu hỏi thành công', question);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.questionsService.remove(id);
    return new ApiResponse(200, 'Xóa câu hỏi thành công');
  }

  @Get(':id/answers')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findAnswer(@Param('id', ParseIntPipe) id: number) {
    const question = await this.questionsService.findAnswers(id);
    return new ApiResponse(
      200,
      'Lấy câu hỏi theo môn học thành công',
      question,
    );
  }
}
