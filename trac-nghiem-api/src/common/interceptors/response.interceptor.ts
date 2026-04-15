import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    
    return next.handle().pipe(
      map((data) => {
        // Nếu controller đã trả về ApiResponse rồi thì giữ nguyên
        if (data instanceof ApiResponse) {
          return data;
        }

        // Tự động bọc response thành ApiResponse
        return new ApiResponse(
          1,                    // success = 1
          'Thành công',         // message mặc định
          data                  // dữ liệu trả về
        );
      }),
    );
  }
}