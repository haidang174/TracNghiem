//src/modules/exams/exams.service.ts
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { Exam } from './entities/exam.entity';
import { ExamVariant } from './entities/exam-variant.entity';
import { VariantQuestion } from './entities/variant-question.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import {
  ExamResponseDto,
  VariantResponseDto,
  VariantQuestionResponseDto,
} from './dto/exam-response.dto';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private examRepo: Repository<Exam>,

    @InjectRepository(ExamVariant)
    private variantRepo: Repository<ExamVariant>,

    @InjectRepository(VariantQuestion)
    private variantQuestionRepo: Repository<VariantQuestion>,

    private dataSource: DataSource,
  ) {}

  // Mappers

  private toResponseDto(exam: Exam): ExamResponseDto {
    return {
      id: exam.id,
      title: exam.title,
      subject_id: exam.subject_id,
      subject_name: exam.subject?.name,
      duration: exam.duration,
      question_count: exam.question_count,
      variant_count: exam.variant_count,
      created_by: exam.created_by,
      created_at: exam.created_at,
      variants: exam.variants?.map((v) => this.toVariantDto(v)),
    };
  }

  private toVariantDto(variant: ExamVariant): VariantResponseDto {
    return {
      id: variant.id,
      variant_code: variant.variant_code,
    };
  }

  private toVariantQuestionDto(
    vq: VariantQuestion,
  ): VariantQuestionResponseDto {
    return {
      order_index: vq.order_index,
      question_id: vq.question_id,
      content: vq.question?.content,
      answers:
        vq.question?.answers?.map((a) => ({
          id: a.id,
          content: a.content,
          // is_correct bị loại bỏ
        })) ?? [],
    };
  }

  // Internal: lấy raw entity

  private async findEntity(id: number): Promise<Exam> {
    const exam = await this.examRepo.findOne({
      where: { id },
      relations: ['variants', 'subject'],
    });
    if (!exam) throw new NotFoundException(`Exam #${id} không tồn tại`);
    return exam;
  }

  // Public methods

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: ExamResponseDto[]; total: number }> {
    const where = search ? { title: ILike(`%${search}%`) } : {};

    const [exams, total] = await this.examRepo.findAndCount({
      where,
      relations: ['variants', 'subject'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: exams.map((e) => this.toResponseDto(e)), total };
  }

  async findAll(): Promise<ExamResponseDto[]> {
    const exams = await this.examRepo.find({ relations: ['variants'] });
    return exams.map((e) => this.toResponseDto(e));
  }

  async findOne(id: number): Promise<ExamResponseDto> {
    const exam = await this.findEntity(id);
    return this.toResponseDto(exam);
  }

  async create(dto: CreateExamDto, userId: number): Promise<ExamResponseDto> {
    const exam = this.examRepo.create({ ...dto, created_by: userId });
    const saved = await this.examRepo.save(exam);
    const full = await this.findEntity(saved.id);
    return this.toResponseDto(full);
  }

  async update(
    id: number,
    dto: Partial<CreateExamDto>,
  ): Promise<ExamResponseDto> {
    const exam = await this.findEntity(id);
    Object.assign(exam, dto);
    const saved = await this.examRepo.save(exam);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const exam = await this.findEntity(id);

    const variants = await this.variantRepo.find({ where: { exam_id: id } });
    if (variants.length > 0) {
      const variantIds = variants.map((v) => v.id);
      for (const variantId of variantIds) {
        await this.variantQuestionRepo.delete({ variant_id: variantId });
      }
      await this.variantRepo.delete({ exam_id: id });
    }

    await this.examRepo.remove(exam);
  }

  async findVariants(exam_id: number): Promise<VariantResponseDto[]> {
    await this.findEntity(exam_id);
    const variants = await this.variantRepo.find({ where: { exam_id } });
    return variants.map((v) => this.toVariantDto(v));
  }

  async findVariantQuestions(
    exam_id: number,
    variant_id: number,
  ): Promise<VariantQuestionResponseDto[]> {
    await this.findEntity(exam_id);

    const variant = await this.variantRepo.findOne({
      where: { id: variant_id, exam_id },
    });
    if (!variant)
      throw new NotFoundException(
        `Variant #${variant_id} không thuộc exam #${exam_id}`,
      );

    const vqs = await this.variantQuestionRepo.find({
      where: { variant_id },
      relations: ['question', 'question.answers'],
      order: { order_index: 'ASC' },
    });

    return vqs.map((vq) => this.toVariantQuestionDto(vq));
  }

  async generateVariants(exam_id: number): Promise<VariantResponseDto[]> {
    const exam = await this.findEntity(exam_id);

    const allQuestions = await this.dataSource.query(
      `SELECT id FROM questions WHERE subject_id = ? ORDER BY RAND()`,
      [exam.subject_id],
    );

    if (allQuestions.length < exam.question_count) {
      throw new BadRequestException(
        `Môn học chỉ có ${allQuestions.length} câu, cần ít nhất ${exam.question_count} câu`,
      );
    }

    // Xoá variant cũ nếu có
    const oldVariants = await this.variantRepo.find({ where: { exam_id } });
    if (oldVariants.length > 0) {
      const oldIds = oldVariants.map((v) => v.id);
      await this.variantQuestionRepo.delete(
        oldIds.map((id) => ({ variant_id: id })),
      );
      await this.variantRepo.remove(oldVariants);
    }

    const savedVariants: ExamVariant[] = [];

    for (let i = 0; i < exam.variant_count; i++) {
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, exam.question_count);

      const variant_code = String.fromCharCode(65 + i); // A, B, C...

      const variant = await this.variantRepo.save(
        this.variantRepo.create({ exam_id, variant_code }),
      );

      const vqs = selected.map((q: { id: number }, index: number) =>
        this.variantQuestionRepo.create({
          variant_id: variant.id,
          question_id: q.id,
          order_index: index + 1,
        }),
      );
      await this.variantQuestionRepo.save(vqs);
      savedVariants.push(variant);
    }

    return savedVariants.map((v) => this.toVariantDto(v));
  }
}
