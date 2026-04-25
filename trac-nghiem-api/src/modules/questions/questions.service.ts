//src/modules/questions/questions.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import {
  QuestionResponseDto,
  AnswerResponseDto,
} from './dto/question-response.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,

    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
  ) {}

  // Mappers

  private toAnswerDto(answer: Answer): AnswerResponseDto {
    return {
      id: answer.id,
      content: answer.content,
      is_correct: answer.is_correct,
    };
  }

  private toResponseDto(
    question: Question,
    withAnswers = false,
  ): QuestionResponseDto {
    return {
      id: question.id,
      subject_id: question.subject_id,
      subject_name: question.subject?.name,
      content: question.content,
      created_by: question.created_by,
      created_at: question.created_at,
      ...(withAnswers && {
        answers: question.answers?.map((a) => this.toAnswerDto(a)) ?? [],
      }),
    };
  }

  // Internal

  private async findEntity(id: number): Promise<Question> {
    const question = await this.questionRepo.findOne({
      where: { id },
      relations: ['answers'],
    });
    if (!question) throw new NotFoundException(`Question #${id} không tồn tại`);
    return question;
  }

  private validateAnswers(answers: CreateQuestionDto['answers']): void {
    const correctCount = answers.filter((a) => a.is_correct).length;
    if (correctCount !== 1) {
      throw new BadRequestException('Câu hỏi phải có đúng 1 đáp án đúng');
    }
  }

  // Public methods

  async findAll(
    subject_id?: number,
    search?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: QuestionResponseDto[]; total: number }> {
    const where: FindOptionsWhere<Question> | FindOptionsWhere<Question>[] = {};

    if (subject_id) where['subject_id'] = subject_id;

    const baseWhere = search
      ? [{ ...where, content: ILike(`%${search}%`) }]
      : where;

    const [questions, total] = await this.questionRepo.findAndCount({
      where: baseWhere,
      relations: ['answers', 'subject'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: questions.map((q) => this.toResponseDto(q, true)), total };
  }

  async findOne(id: number): Promise<QuestionResponseDto> {
    const question = await this.findEntity(id);
    return this.toResponseDto(question, true);
  }

  async create(
    dto: CreateQuestionDto,
    user_id: number,
  ): Promise<QuestionResponseDto> {
    this.validateAnswers(dto.answers);

    const question = await this.questionRepo.save(
      this.questionRepo.create({
        subject_id: dto.subject_id,
        content: dto.content,
        created_by: user_id,
      }),
    );

    const answers = dto.answers.map((a) =>
      this.answerRepo.create({ ...a, question_id: question.id }),
    );
    await this.answerRepo.save(answers);

    const full = await this.findEntity(question.id);
    return this.toResponseDto(full, true);
  }

  async update(
    id: number,
    dto: Partial<CreateQuestionDto>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user_id: number,
  ): Promise<QuestionResponseDto> {
    const question = await this.findEntity(id);

    // Cập nhật thông tin câu hỏi
    if (dto.content) question.content = dto.content;
    if (dto.subject_id) question.subject_id = dto.subject_id;

    await this.questionRepo.save(question);

    // Nếu có cập nhật answers — xoá cũ, tạo mới
    if (dto.answers) {
      this.validateAnswers(dto.answers);
      await this.answerRepo.delete({ question_id: id });
      const newAnswers = dto.answers.map((a) =>
        this.answerRepo.create({ ...a, question_id: id }),
      );
      await this.answerRepo.save(newAnswers);
    }

    const full = await this.findEntity(id);
    return this.toResponseDto(full, true);
  }

  async remove(id: number): Promise<void> {
    const question = await this.findEntity(id);
    await this.answerRepo.delete({ question_id: id });
    await this.questionRepo.remove(question);
  }

  // Endpoint riêng chỉ xem đáp án — GET /questions/:id/answers
  async findAnswers(id: number): Promise<AnswerResponseDto[]> {
    const question = await this.findEntity(id);
    return question.answers.map((a) => this.toAnswerDto(a));
  }
}
