import { Injectable, NotFoundException } from '@nestjs/common';
import { LessonDto } from './dto/lesson.dto';
import { InjectModel } from 'nestjs-typegoose';
import { LessonModel } from './lesson.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import mongoose from 'mongoose';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(LessonModel)
    private readonly LessonModel: ModelType<LessonModel>,
  ) {}

  async findById(_id: string) {
    const findSelectedLesson = await this.LessonModel.findById(_id);

    return findSelectedLesson;
  }

  async createNewLessons(lessonDto: LessonDto) {
    const create = new this.LessonModel({
      _id: new mongoose.Types.ObjectId(),
      ownerID: lessonDto.ownerID,
      lessonName: lessonDto.lessonName,
      template: lessonDto.template,
    });

    const createNewFolder = await create.save();
    return createNewFolder;
  }

  async createIssue(lessonID: string) {
    const lesson = await this.LessonModel.findById(lessonID);
    if (!lesson) {
      throw new NotFoundException('Урок не найден');
    }

    const symbols = ['A', 'B', 'C', 'D', 'F', 'G'];
    const numbers = [1, 2, 3, 4, 5, 6];

    const newQuestion: any = {
      questionName: '',
      questionFields: symbols.map((symbol, index) => ({
        number: numbers[index],
        symbol: symbol,
        field: '',
        isCorrect: false,
      })),
    };

    lesson.questions.push(newQuestion);
    await lesson.save();

    return newQuestion;
  }

  async deleteSelectedIssue(issueID: string) {
    const lesson = await this.LessonModel.findOneAndUpdate(
      {
        'questions._id': issueID,
      },
      {
        $pull: {
          questions: { _id: issueID },
        },
      },
      {
        new: true,
      },
    );

    return lesson;
  }

  async changeCurrent(issueID: string, data: any) {
    const lesson = await this.LessonModel.findOne({
      'questions._id': issueID,
      'questions.questionFields.symbol': data.symbol,
    });

    if (lesson) {
      // Найдем нужный вопрос по его ID
      const question = lesson.questions.find(
        (q) => q._id.toString() === issueID,
      );

      if (question) {
        // Найдем нужное поле по символу
        const field = question.questionFields.find(
          (f) => f.symbol === data.symbol,
        );

        if (field) {
          {
            field.isCorrect === true
              ? (field.isCorrect = false)
              : (field.isCorrect = true);
          }
          await lesson.save();
          return lesson;
        } else {
          throw new Error('Field not found');
        }
      } else {
        throw new Error('Question not found');
      }
    } else {
      throw new Error('Lesson not found');
    }
  }

  async delete(lessonID: string) {
    const lesson = await this.LessonModel.findByIdAndDelete(lessonID);

    if (!lesson) {
      throw new NotFoundException('Такой папки не существует');
    }

    return lesson;
  }
}
