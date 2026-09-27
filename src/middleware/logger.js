import pinoHttp from 'pino-http';

export const logger = pinoHttp({
    transport: process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname'
        }
    } : undefined,
    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url,
            body: req.raw.body
        }),
        res: (res) => ({
            statusCode: res.statusCode
        })
    }
});

export default logger;