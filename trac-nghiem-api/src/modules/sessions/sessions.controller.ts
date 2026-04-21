//src/modules/sessions/sessions.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';
import { AddStudentsDto } from './dto/add-students.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiResponse } from '../../common/dto/api-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  async findAll() {
    const sessions = await this.sessionsService.findAll();
    return new ApiResponse(200, 'Lấy danh sách phòng thi thành công', sessions);
  }

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  async create(
    @Body() dto: CreateSessionDto,
    @CurrentUser('id') userId: number,
  ) {
    const session = await this.sessionsService.create(dto, userId);
    return new ApiResponse(200, 'Tạo phòng thi thành công', session);
  }

  // STUDENT chỉ xem session mình tham gia — kiểm tra trong service
  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') role: Role,
  ) {
    const studentId = role === Role.STUDENT ? userId : undefined;
    const session = await this.sessionsService.findOne(id, studentId);
    return new ApiResponse(200, 'Xem chi tiết phòng thi thành công', session);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.TEACHER)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSessionStatusDto,
  ) {
    const session = await this.sessionsService.updateStatus(id, dto);
    return new ApiResponse(
      200,
      'Cập nhật trạng thái phòng thi thành công',
      session,
    );
  }

  @Get(':id/students')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findStudents(@Param('id', ParseIntPipe) id: number) {
    const session = await this.sessionsService.findStudents(id);
    return new ApiResponse(
      200,
      'Lấy danh sách học sinh trong phòng thi thành công',
      session,
    );
  }

  @Post(':id/students')
  @Roles(Role.ADMIN, Role.TEACHER)
  async addStudents(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddStudentsDto,
  ) {
    const session = await this.sessionsService.addStudents(id, dto);
    return new ApiResponse(
      200,
      'Thêm học sinh vào phòng thi thành công',
      session,
    );
  }

  @Delete(':id/students/:sid')
  @Roles(Role.ADMIN, Role.TEACHER)
  async removeStudent(
    @Param('id', ParseIntPipe) sessionId: number,
    @Param('sid', ParseIntPipe) studentId: number,
  ) {
    await this.sessionsService.removeStudent(sessionId, studentId);
    return new ApiResponse(200, 'Xóa học sinh khỏi phòng thi thành công');
  }
}
