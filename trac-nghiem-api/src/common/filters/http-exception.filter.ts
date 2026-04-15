import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto/api-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // Lấy message lỗi
    const exceptionResponse = exception.getResponse();
    let errorMessage: string = 'Có lỗi xảy ra';

    if (typeof exceptionResponse === 'object' && exceptionResponse['message']) {
      errorMessage = Array.isArray(exceptionResponse['message'])
        ? exceptionResponse['message'][0]
        : exceptionResponse['message'];
    } else if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    }

    // Trả về theo format ApiResponse
    const apiResponse = new ApiResponse(
      0,                    // success = 0 (lỗi)
      errorMessage,
      null
    );

    response.status(status).json(apiResponse);
  }
}