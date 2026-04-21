import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  username: '2k573cTqtncSS2K.root',
  password: 'p6pgN88fvWMx8uUd',
  database: 'TracNghiem',

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: true,
  timezone: '+07:00',

  ssl: {
    rejectUnauthorized: false,
  },
};
