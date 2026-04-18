//src/config/jwt.config.ts
export const jwtConfig = {
    secret: 'your_super_secret_key_change_in_production_2026',
     expiresIn: '1d' as const,
  refreshExpiresIn: '7d' as const,   // Refresh Token hết hạn sau 7 ngày
};