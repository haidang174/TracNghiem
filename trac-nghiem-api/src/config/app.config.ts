//src/config/app.config.ts
export const appConfig = {
    port: 3000,
    environment: 'development',
    apiPrefix: 'api',
    cors: {
        origin: '*',
        credentials: true,
    },
};