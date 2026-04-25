//src/modules/exams/exams.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // GET /exams
  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    const result = await this.examsService.findAllPaginated(
      +page,
      +limit,
      search,
    );
    return new ApiResponse(200, 'Lấy danh sách đề thi thành công', {
      data: result.data,
      total: result.total,
      page: +page,
      limit: +limit,
    });
  }

  // POST /exams
  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  async create(
    @Body() dto: CreateExamDto,
    @CurrentUser('id') user_id: number, // lấy id từ JWT payload
  ) {
    const exam = await this.examsService.create(dto, user_id);
    return new ApiResponse(200, 'Tạo đề thi thành công', exam);
  }

  // GET /exams/:id
  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const exam = await this.examsService.findOne(id);
    return new ApiResponse(200, 'Lấy thông tin đề thi thành công', exam);
  }

  // PUT /exams/:id
  @Put(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateExamDto>,
  ) {
    const exam = await this.examsService.update(id, dto);
    return new ApiResponse(200, 'Cập nhật đề thi thành công', exam);
  }

  // DELETE /exams/:id
  @Delete(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.examsService.remove(id);
    return new ApiResponse(200, 'Xóa đề thi thành công');
  }

  // GET /exams/:id/variants
  @Get(':id/variants')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findVariants(@Param('id', ParseIntPipe) id: number) {
    const variants = await this.examsService.findVariants(id);
    return new ApiResponse(
      200,
      'Lấy danh sách biến thể đề thi thành công',
      variants,
    );
  }

  // POST /exams/:id/generate-variants
  @Post(':id/generate-variants')
  @Roles(Role.ADMIN, Role.TEACHER)
  async generateVariants(@Param('id', ParseIntPipe) id: number) {
    const variants = await this.examsService.generateVariants(id);
    return new ApiResponse(200, 'Tạo biến thể đề thi thành công', variants);
  }

  // GET /exams/:id/variants/:vid/questions
  @Get(':id/variants/:vid/questions')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getVariantQuestions(
    @Param('id', ParseIntPipe) id: number,
    @Param('vid', ParseIntPipe) variant_id: number,
  ) {
    const data = await this.examsService.findVariantQuestions(id, variant_id);
    return new ApiResponse(200, 'Lấy câu hỏi biến thể thành công', data);
  }
}
