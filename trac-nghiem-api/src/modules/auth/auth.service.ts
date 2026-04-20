import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { jwtConfig } from '../../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

      const payload = { sub: user.id, username: user.username, role: user.role, fullname: user.fullName };

      return {
        accessToken: this.jwtService.sign(payload, {
          secret: jwtConfig.secret,
          expiresIn: jwtConfig.expiresIn,
        }),
      // user: {
      //   id: user.id,
      //   username: user.username,
      //   fullName: user.fullName,
      //   role: user.role,
      // },
    };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(userId, hashed);
  }
}