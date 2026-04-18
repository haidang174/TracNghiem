import {
  Controller, Post, Get, Body, UseGuards, HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login — public, không cần guard
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return new ApiResponse(1, 'Đăng nhập thành công', result);
  }

  // POST /auth/logout — tất cả role
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  logout() {
    return new ApiResponse(1, 'Đăng xuất thành công');
  }

  // GET /auth/me — tất cả role
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: any) {
    return new ApiResponse(1, 'Lấy thông tin thành công', user);
  }

  // POST /auth/change-password — tất cả role
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async changePassword(
    @CurrentUser() user: any,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.changePassword(user.id, currentPassword, newPassword);
    return new ApiResponse(1, 'Đổi mật khẩu thành công');
  }
}