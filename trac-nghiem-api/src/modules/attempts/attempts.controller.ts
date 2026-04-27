//src/modules/attempts/attempts.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiResponse } from '../../common/dto/api-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  // POST /sessions/:id/start
  @Post('sessions/:id/start')
  @Roles(Role.STUDENT)
  async startAttempt(
    @Param('id', ParseIntPipe) session_id: number,
    @CurrentUser('id') student_id: number,
  ) {
    const attempt = await this.attemptsService.startAttempt(
      session_id,
      student_id,
    );
    return new ApiResponse(200, 'Bắt đầu bài thi thành công', attempt);
  }

  @Get('sessions/:id/my-attempt')
  @Roles(Role.STUDENT)
  async getMyAttempt(
    @Param('id', ParseIntPipe) session_id: number,
    @CurrentUser('id') student_id: number,
  ) {
    const attempt = await this.attemptsService.findBySession(
      session_id,
      student_id,
    );
    return new ApiResponse(200, 'Lấy bài làm thành công', attempt);
  }

  // GET /attempts/:id/questions
  @Get('attempts/:id/questions')
  @Roles(Role.STUDENT)
  async getQuestions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') student_id: number,
  ) {
    const attempt = await this.attemptsService.getQuestions(id, student_id);
    return new ApiResponse(200, 'Lấy danh sách câu hỏi thành công', attempt);
  }

  // POST /attempts/:id/answer
  @Post('attempts/:id/answer')
  @Roles(Role.STUDENT)
  async submitAnswer(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') student_id: number,
    @Body() dto: SubmitAnswerDto,
  ) {
    const attempt = await this.attemptsService.submitAnswer(
      id,
      student_id,
      dto,
    );
    return new ApiResponse(200, 'Lưu câu trả lời thành công', attempt);
  }

  // POST /attempts/:id/submit
  @Post('attempts/:id/submit')
  @Roles(Role.STUDENT)
  async submitAttempt(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') student_id: number,
  ) {
    const attempt = await this.attemptsService.submitAttempt(id, student_id);
    return new ApiResponse(200, 'Nộp bài thi thành công', attempt);
  }

  // GET /attempts/:id
  @Get('attempts/:id')
  @Roles(Role.STUDENT)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') student_id: number,
  ) {
    const attempt = await this.attemptsService.findOne(id, student_id);
    return new ApiResponse(200, 'Lấy thông tin bài làm thành công', attempt);
  }

  // PATCH /attempts/:id/tab-switch
  @Patch('attempts/:id/tab-switch')
  @Roles(Role.STUDENT)
  async recordTabSwitch(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') student_id: number,
  ) {
    const attempt = await this.attemptsService.recordTabSwitch(id, student_id);
    return new ApiResponse(200, 'Đã ghi nhận việc chuyển tab', attempt);
  }
}
