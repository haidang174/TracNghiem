export class UserResponseDto {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  role: string;
  createdAt?: Date;
}