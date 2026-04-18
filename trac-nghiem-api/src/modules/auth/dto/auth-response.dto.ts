export class AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  };
}