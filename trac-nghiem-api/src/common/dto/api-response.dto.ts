export class ApiResponse {
    success: number;
    message: string;
    data: any;

    constructor(success: number, message: string, data: any = null) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}