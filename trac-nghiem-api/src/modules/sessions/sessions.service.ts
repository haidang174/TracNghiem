//src/modules/sessions/sessions.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ExamSession, SessionStatus } from './entities/exam-session.entity';
import { SessionStudent } from './entities/session-student.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';
import { AddStudentsDto } from './dto/add-students.dto';
import {
  SessionResponseDto,
  SessionStudentResponseDto,
} from './dto/session-response.dto';

const VALID_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  [SessionStatus.DRAFT]: [SessionStatus.ACTIVE],
  [SessionStatus.ACTIVE]: [SessionStatus.CLOSED],
  [SessionStatus.CLOSED]: [],
};

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(ExamSession)
    private sessionRepo: Repository<ExamSession>,

    @InjectRepository(SessionStudent)
    private sessionStudentRepo: Repository<SessionStudent>,
  ) {}

  // Mappers

  private toResponseDto(session: ExamSession): SessionResponseDto {
    return {
      id: session.id,
      exam_id: session.exam_id,
      exam_title: session.exam?.title,
      title: session.title,
      duration: session.duration,
      end_time: session.end_time,
      status: session.status,
      created_by: session.created_by,
      created_at: session.created_at,
      student_count: session.sessionStudents?.length,
    };
  }

  private toStudentResponseDto(ss: SessionStudent): SessionStudentResponseDto {
    return {
      id: ss.id,
      student_id: ss.student_id,
      student_name: ss.student?.fullName,
      email: ss.student?.email,
    };
  }

  // Internal: lấy raw entity (dùng nội bộ service)

  private async findEntity(id: number): Promise<ExamSession> {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['exam', 'sessionStudents'],
    });
    if (!session) throw new NotFoundException(`Session #${id} không tồn tại`);
    return session;
  }

  // Public methods

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: SessionResponseDto[]; total: number }> {
    const where = search ? { title: ILike(`%${search}%`) } : {};

    const [sessions, total] = await this.sessionRepo.findAndCount({
      where,
      relations: ['exam', 'sessionStudents'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: sessions.map((s) => this.toResponseDto(s)), total };
  }

  async findAll(): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionRepo.find({
      relations: ['exam', 'sessionStudents'],
    });
    return sessions.map((s) => this.toResponseDto(s));
  }

  async findOne(id: number, student_id?: number): Promise<SessionResponseDto> {
    const session = await this.findEntity(id);

    if (student_id) {
      const enrolled = await this.sessionStudentRepo.findOne({
        where: { session_id: id, student_id },
      });
      if (!enrolled)
        throw new ForbiddenException('Bạn không tham gia phòng thi này');
    }

    return this.toResponseDto(session);
  }

  async create(
    dto: CreateSessionDto,
    user_id: number,
  ): Promise<SessionResponseDto> {
    const session = this.sessionRepo.create({
      exam_id: dto.exam_id,
      title: dto.title,
      duration: dto.duration,
      end_time: new Date(dto.end_time),
      status: SessionStatus.DRAFT,
      created_by: user_id,
    });
    const saved = await this.sessionRepo.save(session);
    // Load lại relations để mapper có đủ data
    const full = await this.findEntity(saved.id);
    return this.toResponseDto(full);
  }

  async updateStatus(
    id: number,
    dto: UpdateSessionStatusDto,
  ): Promise<SessionResponseDto> {
    const session = await this.findEntity(id);

    const allowed = VALID_TRANSITIONS[session.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ "${session.status}" sang "${dto.status}"`,
      );
    }

    session.status = dto.status;
    const saved = await this.sessionRepo.save(session);
    return this.toResponseDto(saved);
  }

  async findStudents(session_id: number): Promise<SessionStudentResponseDto[]> {
    await this.findEntity(session_id);
    const records = await this.sessionStudentRepo.find({
      where: { session_id },
      relations: ['student'],
    });
    return records.map((ss) => this.toStudentResponseDto(ss));
  }

  async addStudents(
    session_id: number,
    dto: AddStudentsDto,
  ): Promise<SessionStudentResponseDto[]> {
    const session = await this.findEntity(session_id);

    if (session.status !== SessionStatus.DRAFT) {
      throw new BadRequestException(
        'Chỉ có thể thêm học sinh khi phòng thi ở trạng thái draft',
      );
    }

    const existing = await this.sessionStudentRepo.find({
      where: { session_id },
    });
    const existingIds = existing.map((ss) => ss.student_id);
    const newIds = dto.student_ids.filter((id) => !existingIds.includes(id));

    if (newIds.length === 0) {
      throw new BadRequestException('Tất cả học sinh đã có trong phòng thi');
    }

    const records = newIds.map((student_id) =>
      this.sessionStudentRepo.create({ session_id, student_id }),
    );
    const saved = await this.sessionStudentRepo.save(records);

    // Load lại relations để trả về đúng DTO
    const full = await this.sessionStudentRepo.find({
      where: { session_id },
      relations: ['student'],
    });
    return full
      .filter((ss) => saved.map((s) => s.id).includes(ss.id))
      .map((ss) => this.toStudentResponseDto(ss));
  }

  async removeStudent(session_id: number, student_id: number): Promise<void> {
    const session = await this.findEntity(session_id);

    if (session.status !== SessionStatus.DRAFT) {
      throw new BadRequestException(
        'Chỉ có thể xoá học sinh khi phòng thi ở trạng thái draft',
      );
    }

    const record = await this.sessionStudentRepo.findOne({
      where: { session_id, student_id },
    });
    if (!record)
      throw new NotFoundException('Học sinh không có trong phòng thi này');

    await this.sessionStudentRepo.remove(record);
  }
}
