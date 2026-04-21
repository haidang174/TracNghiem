//src/modules/exams/exams.service.ts
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Exam } from './entities/exam.entity';
import { ExamVariant } from './entities/exam-variant.entity';
import { VariantQuestion } from './entities/variant-question.entity';
import { CreateExamDto } from './dto/create-exam.dto';

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

  async findAll(): Promise<Exam[]> {
    return this.examRepo.find({ relations: ['subject', 'creator'] });
  }

  async findOne(id: number): Promise<Exam> {
    const exam = await this.examRepo.findOne({
      where: { id },
      relations: ['subject', 'creator', 'variants'],
    });
    if (!exam) throw new NotFoundException(`Exam #${id} không tồn tại`);
    return exam;
  }

  async create(dto: CreateExamDto, userId: number): Promise<Exam> {
    const exam = this.examRepo.create({ ...dto, created_by: userId });
    return this.examRepo.save(exam);
  }

  async update(id: number, dto: Partial<CreateExamDto>): Promise<Exam> {
    const exam = await this.findOne(id);
    Object.assign(exam, dto);
    return this.examRepo.save(exam);
  }

  async remove(id: number): Promise<void> {
    const exam = await this.findOne(id);
    await this.examRepo.remove(exam);
  }

  // Lấy danh sách variants của 1 đề thi
  async findVariants(exam_id: number): Promise<ExamVariant[]> {
    await this.findOne(exam_id); // check tồn tại
    return this.variantRepo.find({ where: { exam_id } });
  }

  // Lấy câu hỏi theo từng variant
  async findVariantQuestions(
    exam_id: number,
    variant_id: number,
  ): Promise<VariantQuestion[]> {
    await this.findOne(exam_id);
    const variant = await this.variantRepo.findOne({
      where: { id: variant_id, exam_id },
    });
    if (!variant)
      throw new NotFoundException(
        `Variant #${variant_id} không thuộc exam #${exam_id}`,
      );

    return this.variantQuestionRepo.find({
      where: { variant_id },
      relations: ['question'],
      order: { order_index: 'ASC' },
    });
  }

  // Tự động sinh variant ngẫu nhiên
  async generateVariants(exam_id: number): Promise<ExamVariant[]> {
    const exam = await this.findOne(exam_id);

    // Lấy toàn bộ câu hỏi thuộc subject của đề thi
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
      // Xáo trộn và chọn đủ số câu
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, exam.question_count);

      const variant_code = String.fromCharCode(65 + i); // A, B, C, D...

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

    return savedVariants;
  }
}
