//src/config/jwt.config.ts
export const jwtConfig = {
    secret: 'your_super_secret_key_change_in_production_2026',
    expiresIn: '1d',          // Access Token hết hạn sau 1 ngày
    refreshExpiresIn: '7d',   // Refresh Token hết hạn sau 7 ngày
};