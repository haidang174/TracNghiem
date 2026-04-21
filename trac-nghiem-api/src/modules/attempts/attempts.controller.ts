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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  // POST /sessions/:id/start
  @Post('sessions/:id/start')
  @Roles(Role.STUDENT)
  startAttempt(
    @Param('id', ParseIntPipe) session_id: number,
    @CurrentUser('id') student_id: number,
  ) {
    return this.attemptsService.startAttempt(session_id, student_id);
  }

  // GET /attempts/:id/questions
  @Get('attempts/:id/questions')
  @Roles(Role.STUDENT)
  getQuestions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') student_id: number,
  ) {
    return this.attemptsService.getQuestions(id, student_id);
  }

  // POST /attempts/:id/answer
  @Post('attempts/:id/answer')
  @Roles(Role.STUDENT)
  submitAnswer(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') student_id: number,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.attemptsService.submitAnswer(id, student_id, dto);
  }

  // POST /attempts/:id/submit
  @Post('attempts/:id/submit')
  @Roles(Role.STUDENT)
  submitAttempt(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') student_id: number,
  ) {
    return this.attemptsService.submitAttempt(id, student_id);
  }

  // GET /attempts/:id
  @Get('attempts/:id')
  @Roles(Role.STUDENT)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') student_id: number,
  ) {
    return this.attemptsService.findOne(id, student_id);
  }

  // PATCH /attempts/:id/tab-switch
  @Patch('attempts/:id/tab-switch')
  @Roles(Role.STUDENT)
  recordTabSwitch(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') student_id: number,
  ) {
    return this.attemptsService.recordTabSwitch(id, student_id);
  }
}
