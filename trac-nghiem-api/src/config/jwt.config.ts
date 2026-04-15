// src/config/jwt.config.ts
export const jwtConstants = {
    secret: 'your_super_secret_key_change_in_production_2026',
    expiresIn: '1h'as const,
    refreshExpiresIn: '7d',
};