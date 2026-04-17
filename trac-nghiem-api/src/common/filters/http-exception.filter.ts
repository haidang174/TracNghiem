// ĐÃ SỬA
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto/api-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    let errorMessage = 'Có lỗi xảy ra';

    if (typeof exceptionResponse === 'object' && exceptionResponse['message']) {
      errorMessage = Array.isArray(exceptionResponse['message'])
        ? exceptionResponse['message'][0]
        : exceptionResponse['message'];
    } else if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    }

    const apiResponse = new ApiResponse(0, errorMessage, null);

    response.status(status).json(apiResponse);
  }
}