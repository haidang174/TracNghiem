//src/modules/results/results.service.ts
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Attempt, AttemptStatus } from '../attempts/entities/attempt.entity';
import { SessionStudent } from '../sessions/entities/session-student.entity';
import {
  AttemptResultDto,
  SessionResultItemDto,
  SessionStatsDto,
  AnswerDetailDto,
  ScoreRangeDto,
} from './dto/result-response.dto';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(Attempt)
    private attemptRepo: Repository<Attempt>,

    @InjectRepository(SessionStudent)
    private sessionStudentRepo: Repository<SessionStudent>,

    private dataSource: DataSource,
  ) {}

  // Internal

  private async findAttemptEntity(id: number): Promise<Attempt> {
    const attempt = await this.attemptRepo.findOne({ where: { id } });
    if (!attempt) throw new NotFoundException(`Attempt #${id} không tồn tại`);
    return attempt;
  }

  private async checkSessionExists(session_id: number): Promise<void> {
    const session = await this.dataSource.query(
      `SELECT id FROM exam_sessions WHERE id = ?`,
      [session_id],
    );
    if (!session.length) {
      throw new NotFoundException(`Session #${session_id} không tồn tại`);
    }
  }

  private buildDistribution(
    attempts: { score: number | null }[],
  ): ScoreRangeDto[] {
    const ranges = [
      { range: '0-2', min: 0, max: 2 },
      { range: '2-4', min: 2, max: 4 },
      { range: '4-6', min: 4, max: 6 },
      { range: '6-8', min: 6, max: 8 },
      { range: '8-10', min: 8, max: 10 },
    ];

    return ranges.map(({ range, min, max }) => ({
      range,
      count: attempts.filter(
        (a) => a.score !== null && a.score >= min && a.score <= max,
      ).length,
    }));
  }

  // Public methods

  // GET /sessions/:id/results — Kết quả toàn bộ phòng thi (ADMIN, TEACHER)
  async getSessionResults(session_id: number): Promise<SessionResultItemDto[]> {
    await this.checkSessionExists(session_id);

    const rows: any[] = await this.dataSource.query(
      `SELECT
        a.id            AS attempt_id,
        a.student_id,
        u.fullName     AS student_name,
        ev.variant_code,
        a.score,
        a.status,
        a.tab_switch_count,
        COUNT(aa.id)                              AS total_count,
        SUM(CASE WHEN aa.is_correct = 1 THEN 1 ELSE 0 END) AS correct_count
      FROM attempts a
      JOIN users         u  ON u.id  = a.student_id
      JOIN exam_variants ev ON ev.id = a.variant_id
      LEFT JOIN attempt_answers aa ON aa.attempt_id = a.id
      WHERE a.session_id = ?
      GROUP BY a.id, a.student_id, u.fullName, ev.variant_code, a.score, a.status, a.tab_switch_count
      ORDER BY a.score DESC`,
      [session_id],
    );

    return rows.map((r) => ({
      attempt_id: r.attempt_id,
      student_id: r.student_id,
      student_name: r.student_name,
      variant_code: r.variant_code,
      score: r.score,
      correct_count: Number(r.correct_count),
      total_count: Number(r.total_count),
      status: r.status,
      tab_switch_count: r.tab_switch_count,
    }));
  }

  // GET /attempts/:id/result — Kết quả chi tiết 1 bài làm (ADMIN, TEACHER, STUDENT)
  async getAttemptResult(
    attempt_id: number,
    requester_id: number,
    requester_role: string,
  ): Promise<AttemptResultDto> {
    const attempt = await this.findAttemptEntity(attempt_id);

    // STUDENT chỉ xem kết quả của chính mình
    if (requester_role === 'STUDENT' && attempt.student_id !== requester_id) {
      throw new ForbiddenException('Bạn không có quyền xem kết quả này');
    }

    // Lấy thông tin chi tiết từng câu
    const rows: any[] = await this.dataSource.query(
      `SELECT
        q.id              AS question_id,
        q.content         AS question_content,
        aa.answer_id      AS selected_answer_id,
        sel_a.content     AS selected_answer_content,
        cor_a.id          AS correct_answer_id,
        cor_a.content     AS correct_answer_content,
        aa.is_correct
      FROM attempt_answers aa
      JOIN questions q
        ON q.id = aa.question_id
      LEFT JOIN answers sel_a
        ON sel_a.id = aa.answer_id
      JOIN answers cor_a
        ON cor_a.question_id = q.id AND cor_a.is_correct = 1
      WHERE aa.attempt_id = ?
      ORDER BY aa.id`,
      [attempt_id],
    );

    const answers: AnswerDetailDto[] = rows.map((r) => ({
      question_id: r.question_id,
      content: r.question_content,
      selected_answer_id: r.selected_answer_id,
      selected_answer_content: r.selected_answer_content,
      correct_answer_id: r.correct_answer_id,
      correct_answer_content: r.correct_answer_content,
      is_correct: r.is_correct === 1,
    }));

    const correct_count = answers.filter((a) => a.is_correct).length;

    // Lấy thêm thông tin student và variant
    const [meta]: any[] = await this.dataSource.query(
      `SELECT u.fullName, ev.variant_code
       FROM attempts a
       JOIN users u ON u.id = a.student_id
       JOIN exam_variants ev ON ev.id = a.variant_id
       WHERE a.id = ?`,
      [attempt_id],
    );

    return {
      attempt_id,
      student_id: attempt.student_id,
      student_name: meta?.fullName,
      variant_code: meta?.variant_code,
      score: attempt.score ?? 0,
      correct_count,
      total_count: answers.length,
      start_time: attempt.start_time,
      end_time: attempt.end_time,
      tab_switch_count: attempt.tab_switch_count,
      answers,
    };
  }

  // GET /students/:id/attempts — Lịch sử thi của học sinh (ADMIN, TEACHER, STUDENT)
  async getStudentAttempts(
    student_id: number,
    requester_id: number,
    requester_role: string,
  ): Promise<SessionResultItemDto[]> {
    // STUDENT chỉ xem lịch sử của chính mình
    if (requester_role === 'STUDENT' && student_id !== requester_id) {
      throw new ForbiddenException(
        'Bạn không có quyền xem lịch sử thi của người khác',
      );
    }

    const rows: any[] = await this.dataSource.query(
      `SELECT
        a.id            AS attempt_id,
        a.student_id,
        u.fullName     AS student_name,
        ev.variant_code,
        a.score,
        a.status,
        a.tab_switch_count,
        COUNT(aa.id)                                        AS total_count,
        SUM(CASE WHEN aa.is_correct = 1 THEN 1 ELSE 0 END) AS correct_count
      FROM attempts a
      JOIN users         u  ON u.id  = a.student_id
      JOIN exam_variants ev ON ev.id = a.variant_id
      LEFT JOIN attempt_answers aa ON aa.attempt_id = a.id
      WHERE a.student_id = ?
      GROUP BY a.id, a.student_id, u.fullName, ev.variant_code, a.score, a.status, a.tab_switch_count
      ORDER BY a.start_time DESC`,
      [student_id],
    );

    return rows.map((r) => ({
      attempt_id: r.attempt_id,
      student_id: r.student_id,
      student_name: r.student_name,
      variant_code: r.variant_code,
      score: r.score,
      correct_count: Number(r.correct_count),
      total_count: Number(r.total_count),
      status: r.status,
      tab_switch_count: r.tab_switch_count,
    }));
  }

  // GET /sessions/:id/stats — Thống kê điểm toàn phòng thi (ADMIN, TEACHER)
  async getSessionStats(session_id: number): Promise<SessionStatsDto> {
    await this.checkSessionExists(session_id);

    const total_students = await this.sessionStudentRepo.count({
      where: { session_id },
    });

    const submitted = await this.attemptRepo.find({
      where: { session_id, status: AttemptStatus.SUBMITTED },
      select: ['id', 'score'],
    });

    const scores = submitted
      .map((a) => a.score)
      .filter((s): s is number => s !== null);

    const avg_score = scores.length
      ? parseFloat(
          (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
        )
      : 0;
    const highest_score = scores.length ? Math.max(...scores) : 0;
    const lowest_score = scores.length ? Math.min(...scores) : 0;

    return {
      session_id,
      total_students,
      submitted_count: submitted.length,
      avg_score,
      highest_score,
      lowest_score,
      distribution: this.buildDistribution(submitted),
    };
  }
}
