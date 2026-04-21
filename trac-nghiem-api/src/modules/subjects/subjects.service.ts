//src/modules/subjects/subjects.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { Subject } from './entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectResponseDto } from './dto/subject-response.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,
  ) {}

  // Mapper

  private toResponseDto(subject: Subject): SubjectResponseDto {
    return {
      id: subject.id,
      name: subject.name,
      question_count: subject.questions?.length,
    };
  }

  // Internal

  private async findEntity(id: number): Promise<Subject> {
    const subject = await this.subjectRepo.findOne({
      where: { id },
      relations: ['questions'],
    });
    if (!subject) throw new NotFoundException(`Subject #${id} không tồn tại`);
    return subject;
  }

  private async checkDuplicateName(
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.subjectRepo.findOne({ where: { name } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Môn học "${name}" đã tồn tại`);
    }
  }

  // Public methods

  async findAll(): Promise<SubjectResponseDto[]> {
    const subjects = await this.subjectRepo.find({
      relations: ['questions'],
    });
    return subjects.map((s) => this.toResponseDto(s));
  }

  async create(dto: CreateSubjectDto): Promise<SubjectResponseDto> {
    await this.checkDuplicateName(dto.name);
    const subject = await this.subjectRepo.save(
      this.subjectRepo.create({ name: dto.name }),
    );
    return this.toResponseDto(subject);
  }

  async update(id: number, dto: CreateSubjectDto): Promise<SubjectResponseDto> {
    const subject = await this.findEntity(id);
    await this.checkDuplicateName(dto.name, id);
    subject.name = dto.name;
    const saved = await this.subjectRepo.save(subject);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const subject = await this.findEntity(id);

    if (subject.questions?.length > 0) {
      throw new ConflictException(
        `Không thể xoá môn học đang có ${subject.questions.length} câu hỏi`,
      );
    }

    await this.subjectRepo.remove(subject);
  }
}
