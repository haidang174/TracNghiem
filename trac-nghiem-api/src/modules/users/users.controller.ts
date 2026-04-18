import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // POST /users
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const { password, ...data } = user as any;
    return new ApiResponse(1, 'Tạo người dùng thành công', data);
  }

  // GET /users?role=STUDENT
  @Get()
  async findAll(@Query('role') role?: Role) {
    const users = await this.usersService.findAll(role);
    const data = users.map(({ password, ...u }: any) => u);
    return new ApiResponse(1, 'Lấy danh sách người dùng thành công', data);
  }

  // GET /users/:id
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    const { password, ...data } = user as any;
    return new ApiResponse(1, 'Lấy thông tin người dùng thành công', data);
  }

  // PUT /users/:id
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, dto);
    const { password, ...data } = user as any;
    return new ApiResponse(1, 'Cập nhật người dùng thành công', data);
  }

  // DELETE /users/:id
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return new ApiResponse(1, 'Xoá người dùng thành công');
  }

  // PATCH /users/:id/status  — body: { isActive: true/false }
  @Patch(':id/status')
  async setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    const user = await this.usersService.setStatus(id, isActive);
    const { password, ...data } = user as any;
    const msg = isActive ? 'Kích hoạt tài khoản thành công' : 'Khoá tài khoản thành công';
    return new ApiResponse(1, msg, data);
  }
}