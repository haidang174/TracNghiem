//src/modules/sessions/dto/update-session-status.dto.ts
import { IsEnum } from 'class-validator';
import { SessionStatus } from '../entities/exam-session.entity';

export class UpdateSessionStatusDto {
  @IsEnum(SessionStatus)
  status: SessionStatus;
}
