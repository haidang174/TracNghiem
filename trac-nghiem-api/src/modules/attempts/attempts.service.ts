//src/modules/attempts/attempts.service.ts
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Attempt, AttemptStatus } from './entities/attempt.entity';
import { AttemptAnswer } from './entities/attempt-answer.entity';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import {
  AttemptResponseDto,
  AttemptQuestionDto,
} from './dto/attempt-response.dto';
import { SessionStatus } from '../sessions/entities/exam-session.entity';

@Injectable()
export class AttemptsService {
  constructor(
    @InjectRepository(Attempt)
    private attemptRepo: Repository<Attempt>,

    @InjectRepository(AttemptAnswer)
    private attemptAnswerRepo: Repository<AttemptAnswer>,

    private dataSource: DataSource,
  ) {}

  // Mappers

  private toResponseDto(attempt: Attempt, total_count = 0): AttemptResponseDto {
    return {
      id: attempt.id,
      session_id: attempt.session_id,
      variant_id: attempt.variant_id,
      attempt_number: attempt.attempt_number,
      start_time: attempt.start_time,
      end_time: attempt.end_time,
      score: attempt.score,
      status: attempt.status,
      tab_switch_count: attempt.tab_switch_count,
      answered_count: attempt.attempt_answers?.length ?? 0,
      total_count,
      duration_seconds: (attempt.session?.duration ?? 45) * 60,
    };
  }

  // Internal

  private async findEntity(id: number): Promise<Attempt> {
    const attempt = await this.attemptRepo.findOne({
      where: { id },
      relations: ['attempt_answers', 'session', 'session.exam', 'variant'],
    });
    if (!attempt) throw new NotFoundException(`Attempt #${id} không tồn tại`);
    return attempt;
  }

  private guardStudent(attempt: Attempt, student_id: number): void {
    if (attempt.student_id !== student_id) {
      throw new ForbiddenException('Bạn không có quyền truy cập bài làm này');
    }
  }

  private guardInProgress(attempt: Attempt): void {
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Bài thi đã nộp, không thể thực hiện thao tác này',
      );
    }
  }

  // Public methods

  // POST /sessions/:id/start — Học sinh bắt đầu thi
  async startAttempt(
    session_id: number,
    student_id: number,
  ): Promise<AttemptResponseDto> {
    // 1. Kiểm tra session tồn tại và đang active
    const session = await this.dataSource
      .getRepository('exam_sessions')
      .findOne({ where: { id: session_id } });

    if (!session)
      throw new NotFoundException(`Session #${session_id} không tồn tại`);
    if (session.status !== SessionStatus.ACTIVE) {
      throw new BadRequestException('Phòng thi chưa mở hoặc đã đóng');
    }

    // 2. Kiểm tra student có trong phòng thi không
    const enrolled = await this.dataSource
      .getRepository('session_students')
      .findOne({ where: { session_id, student_id } });

    if (!enrolled)
      throw new ForbiddenException(
        'Bạn không có trong danh sách phòng thi này',
      );

    // 3. Kiểm tra đã có attempt chưa (unique session + student)
    const existing = await this.attemptRepo.findOne({
      where: { session_id, student_id },
    });
    if (existing)
      throw new BadRequestException('Bạn đã bắt đầu bài thi này rồi');

    // 4. Gán variant ngẫu nhiên
    const variants: { id: number }[] = await this.dataSource.query(
      `SELECT id FROM exam_variants WHERE exam_id = ?`,
      [session.exam_id],
    );
    if (variants.length === 0) {
      throw new BadRequestException(
        'Đề thi chưa có mã đề, vui lòng liên hệ giáo viên',
      );
    }
    const variant_id = variants[Math.floor(Math.random() * variants.length)].id;

    // 5. Tính attempt_number (phòng cho sau này nếu cho thi lại)
    const attempt_number = 1;

    // 6. Tạo attempt
    const attempt = await this.attemptRepo.save(
      this.attemptRepo.create({
        session_id,
        student_id,
        variant_id,
        attempt_number,
        start_time: new Date(),
        status: AttemptStatus.IN_PROGRESS,
      }),
    );

    // 7. Tạo sẵn attempt_answers rỗng cho tất cả câu hỏi trong variant
    const questions: { question_id: number }[] = await this.dataSource.query(
      `SELECT question_id FROM variant_questions WHERE variant_id = ?`,
      [variant_id],
    );

    const blankAnswers = questions.map((q) =>
      this.attemptAnswerRepo.create({
        attempt_id: attempt.id,
        question_id: q.question_id,
        answer_id: null,
        is_correct: null,
      }),
    );
    await this.attemptAnswerRepo.save(blankAnswers);

    const full = await this.findEntity(attempt.id);
    return this.toResponseDto(full, questions.length);
  }

  async findBySession(
    session_id: number,
    student_id: number,
  ): Promise<AttemptResponseDto> {
    const attempt = await this.attemptRepo.findOne({
      where: { session_id, student_id },
      relations: ['attempt_answers', 'session', 'variant'],
    });
    if (!attempt) throw new NotFoundException('Bạn chưa làm bài thi này');
    return this.toResponseDto(attempt);
  }

  // GET /attempts/:id/questions — Lấy câu hỏi theo mã đề được gán
  async getQuestions(
    id: number,
    student_id: number,
  ): Promise<AttemptQuestionDto[]> {
    const attempt = await this.findEntity(id);
    this.guardStudent(attempt, student_id);
    this.guardInProgress(attempt);

    // Lấy câu hỏi + đáp án theo variant, kèm đáp án student đã chọn
    const rows: {
      order_index: number;
      question_id: number;
      content: string;
      answer_id: number;
      answer_content: string;
      selected_answer_id: number | null;
    }[] = await this.dataSource.query(
      `SELECT
        vq.order_index,
        vq.question_id,
        q.content,
        a.id          AS answer_id,
        a.content     AS answer_content,
        aa.answer_id  AS selected_answer_id
      FROM variant_questions vq
      JOIN questions q  ON q.id  = vq.question_id
      JOIN answers   a  ON a.question_id = vq.question_id
      LEFT JOIN attempt_answers aa
        ON aa.attempt_id  = ?
        AND aa.question_id = vq.question_id
      WHERE vq.variant_id = ?
      ORDER BY vq.order_index, a.id`,
      [attempt.id, attempt.variant_id],
    );

    // Group theo question
    const questionMap = new Map<number, AttemptQuestionDto>();
    for (const row of rows) {
      if (!questionMap.has(row.question_id)) {
        questionMap.set(row.question_id, {
          order_index: row.order_index,
          question_id: row.question_id,
          content: row.content,
          answers: [],
          selected_answer_id: row.selected_answer_id ?? null,
        });
      }
      questionMap.get(row.question_id)!.answers.push({
        id: row.answer_id,
        content: row.answer_content,
        // is_correct bị ẩn hoàn toàn
      });
    }

    return Array.from(questionMap.values()).sort(
      (a, b) => a.order_index - b.order_index,
    );
  }

  // POST /attempts/:id/answer — Gửi đáp án 1 câu
  async submitAnswer(
    id: number,
    student_id: number,
    dto: SubmitAnswerDto,
  ): Promise<void> {
    const attempt = await this.findEntity(id);
    this.guardStudent(attempt, student_id);
    this.guardInProgress(attempt);

    // Kiểm tra câu hỏi có trong variant không
    const vq = await this.dataSource.query(
      `SELECT id FROM variant_questions WHERE variant_id = ? AND question_id = ?`,
      [attempt.variant_id, dto.question_id],
    );
    if (vq.length === 0) {
      throw new BadRequestException('Câu hỏi không thuộc mã đề của bạn');
    }

    // Kiểm tra answer thuộc question không
    const answer = await this.dataSource.query(
      `SELECT id, is_correct FROM answers WHERE id = ? AND question_id = ?`,
      [dto.answer_id, dto.question_id],
    );
    if (answer.length === 0) {
      throw new BadRequestException('Đáp án không hợp lệ');
    }

    // Upsert attempt_answer
    await this.attemptAnswerRepo
      .createQueryBuilder()
      .update(AttemptAnswer)
      .set({
        answer_id: dto.answer_id,
        is_correct: answer[0].is_correct === 1,
      })
      .where('attempt_id = :attempt_id AND question_id = :question_id', {
        attempt_id: attempt.id,
        question_id: dto.question_id,
      })
      .execute();
  }

  // POST /attempts/:id/submit — Nộp bài
  async submitAttempt(
    id: number,
    student_id: number,
  ): Promise<AttemptResponseDto> {
    const attempt = await this.findEntity(id);
    this.guardStudent(attempt, student_id);
    this.guardInProgress(attempt);

    // Tính điểm
    const answers = await this.attemptAnswerRepo.find({
      where: { attempt_id: id },
    });

    const total = answers.length;
    const correct_count = answers.filter((a) => Boolean(a.is_correct)).length;

    const score =
      total > 0 ? parseFloat(((correct_count / total) * 10).toFixed(2)) : 0;

    attempt.score = score;
    attempt.end_time = new Date();
    attempt.status = AttemptStatus.SUBMITTED;
    await this.attemptRepo.save(attempt);

    const full = await this.findEntity(id);
    return this.toResponseDto(full, total);
  }

  // GET /attempts/:id — Xem trạng thái bài làm
  async findOne(id: number, student_id: number): Promise<AttemptResponseDto> {
    const attempt = await this.findEntity(id);
    this.guardStudent(attempt, student_id);

    const total = await this.dataSource.query(
      `SELECT COUNT(*) as cnt FROM variant_questions WHERE variant_id = ?`,
      [attempt.variant_id],
    );

    return this.toResponseDto(attempt, total[0]?.cnt ?? 0);
  }

  // PATCH /attempts/:id/tab-switch — Ghi nhận chuyển tab
  async recordTabSwitch(
    id: number,
    student_id: number,
  ): Promise<{ tab_switch_count: number }> {
    const attempt = await this.findEntity(id);
    this.guardStudent(attempt, student_id);
    this.guardInProgress(attempt);

    attempt.tab_switch_count += 1;
    await this.attemptRepo.save(attempt);

    return { tab_switch_count: attempt.tab_switch_count };
  }
}
