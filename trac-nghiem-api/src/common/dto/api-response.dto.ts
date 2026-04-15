export class ApiResponse {
    success: number;
    message: string;
    data: any;

    constructor(success: number, message: string, data: any = null) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    static success(message: string, data: any = null): ApiResponse {
        return new ApiResponse(1, message, data);
    }

    static error(message: string, data: any = null): ApiResponse {
        return new ApiResponse(0, message, data);
    }
}