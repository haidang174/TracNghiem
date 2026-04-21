//src/modules/subjects/subjects.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { User } from '../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { SubjectsService } from './subjects.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async findAll() {
    const subjects = await this.subjectsService.findAll();
    return new ApiResponse(200, 'Lấy danh sách môn học thành công', subjects);
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateSubjectDto) {
    const subject = await this.subjectsService.create(dto);
    return new ApiResponse(200, 'Tạo môn học thành công', subject);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSubjectDto,
  ) {
    const subject = await this.subjectsService.update(id, dto);
    return new ApiResponse(200, 'Cập nhật môn học thành công', subject);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.subjectsService.remove(id);
    return new ApiResponse(200, 'Xóa môn học thành công');
  }
}
