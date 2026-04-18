// src/database/seeds/admin.seed.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const adminExists = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (adminExists) {
      console.log(' Admin đã tồn tại, bỏ qua seed.');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = this.userRepository.create({
      username: 'admin',
      password: hashedPassword,
      fullName: 'Super Administrator',
      email: 'admin@tracnghiem.com',
      role: Role.ADMIN,
    });

    await this.userRepository.save(admin);
    console.log(' Đã tạo tài khoản Admin mặc định thành công!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
  }
}