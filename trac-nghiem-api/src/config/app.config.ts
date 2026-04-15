import e from "express";

export const appConfig = {
    port:  3000,
    enviroment:  'development',
    apiprefix:'api',
    cors: {
        origin: '*', // Cho phép tất cả các nguồn (có thể tùy chỉnh theo nhu cầu)
        credentials:true,
    },
};