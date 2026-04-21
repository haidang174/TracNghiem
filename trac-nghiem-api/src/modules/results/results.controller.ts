//src/modules/results/results.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiResponse } from '../../common/dto/api-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  // GET /sessions/:id/results
  @Get('sessions/:id/results')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getSessionResults(@Param('id', ParseIntPipe) session_id: number) {
    const result = await this.resultsService.getSessionResults(session_id);
    return new ApiResponse(200, 'Lấy kết quả phiên thi thành công', result);
  }

  // GET /attempts/:id/result
  @Get('attempts/:id/result')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getAttemptResult(
    @Param('id', ParseIntPipe) attempt_id: number,
    @CurrentUser('id') requester_id: number,
    @CurrentUser('role') requester_role: string,
  ) {
    const result = await this.resultsService.getAttemptResult(
      attempt_id,
      requester_id,
      requester_role,
    );
    return new ApiResponse(
      200,
      'Lấy chi tiết kết quả bài làm thành công',
      result,
    );
  }

  // GET /students/:id/attempts
  @Get('students/:id/attempts')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getStudentAttempts(
    @Param('id', ParseIntPipe) student_id: number,
    @CurrentUser('id') requester_id: number,
    @CurrentUser('role') requester_role: string,
  ) {
    const result = await this.resultsService.getStudentAttempts(
      student_id,
      requester_id,
      requester_role,
    );
    return new ApiResponse(
      200,
      'Lấy danh sách bài làm của học sinh thành công',
      result,
    );
  }

  // GET /sessions/:id/stats
  @Get('sessions/:id/stats')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getSessionStats(@Param('id', ParseIntPipe) session_id: number) {
    const result = await this.resultsService.getSessionStats(session_id);
    return new ApiResponse(200, 'Lấy thống kê buổi thi thành công', result);
  }
}
