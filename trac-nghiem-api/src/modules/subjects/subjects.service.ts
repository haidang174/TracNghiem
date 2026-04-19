
import { Injectable } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { Subject } from './entities/subject.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/browser/repository/Repository.js';

@Injectable()

export class SubjectsService {
    constructor(
        @InjectRepository(Subject)
        private subjectsRepository: Repository<Subject>,
    ) {}

    async findAll() {
        return this.subjectsRepository.find();
    }

    
    async create(dto: CreateSubjectDto) {
        if(await this.subjectsRepository.findOne({ where: { name: dto.name } })) {
            throw new Error('Môn học đã tồn tại');
        }
        const subject = await this.subjectsRepository.create(dto);
        return this.subjectsRepository.save(subject);
    }

    

    async update(id: number, dto: CreateSubjectDto) {
        const subject = await this.subjectsRepository.findOne({ where: { id } });
        if (!subject) {
            throw new Error('Môn học không tồn tại');
        }
        Object.assign(subject, dto);
        return this.subjectsRepository.save(subject);
    }

    async remove(id: number) {
        const subject = await this.subjectsRepository.findOne({ where: { id } });
        if (!subject) {
            throw new Error('Môn học không tồn tại');
        }
        return this.subjectsRepository.remove(subject);
    }
}