

import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';

import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SubjectsService } from './subjects.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('subjects')
// UseGuards(JwtAuthGuard,RolesGuard)

export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) { }


  
  @Post()
  @Roles(Role.ADMIN)
    async create(@CurrentUser() user: User, @Body() dto: CreateSubjectDto) {
        const subject = await this.subjectsService.create(dto);
        const { ...data } = subject as any;
        return new ApiResponse( 200,'Tạo môn học thành công', data);
    }
  
    @Get()
    @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
    async getAll() {
        const subjects = await this.subjectsService.findAll();
        return new ApiResponse( 200,'Lấy danh sách môn học thành công', subjects);
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    async update(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number, @Body() dto: CreateSubjectDto) {
        const subject = await this.subjectsService.update(id, dto);
        const { ...data } = subject as any;
        return new ApiResponse( 200,'Cập nhật môn học thành công', data);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    async remove(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
        await this.subjectsService.remove(id);
        return new ApiResponse( 200,'Xóa môn học thành công', null);
    }

}