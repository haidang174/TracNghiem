//src/modules/questions/questions.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { CreateQuestionDto } from './dto/create-question.dto';
@Injectable()
export class QuestionsService {
   constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>
    ) {}

    async findAll() {
        return this.questionRepository.find({ relations: ['answers', 'subject'] });
    }

    async create(dto: CreateQuestionDto) {
        const question = this.questionRepository.create(dto);
        return this.questionRepository.save(question);
    }


    async findOne(id: number) {
        const question = await this.questionRepository.findOne({ where: { id }, relations: ['answers', 'subject'] });
        if (!question) {
            throw new Error('Câu hỏi không tồn tại');
        }
        return question;
    }

    async remove(id: number) {
        const question = await this.questionRepository.findOne({ where: { id } });
        if (!question) {
            throw new Error('Câu hỏi không tồn tại');
        }
        return this.questionRepository.remove(question);
    }

    async update(id: number, dto: CreateQuestionDto) {
        const question = await this.questionRepository.findOne({ where: { id } });
        if (!question) {
            throw new Error('Câu hỏi không tồn tại');
        }
        Object.assign(question, dto);
        return this.questionRepository.save(question);
    }

    async findByIdAnswerforQuestons(id: number) {
        const question = await this.questionRepository.findOne({ where: { id }, relations: ['answers'] });
        if (!question) {
            throw new Error('Câu hỏi không tồn tại');
        }
        return question.answers;
    }
    

}