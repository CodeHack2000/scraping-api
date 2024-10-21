const { format, createLogger, transports } = require('winston');
const { timestamp, combine, printf } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

/**
 * Builds a logger that logs messages to the console in the format
 * 
 *   <timestamp> <level>: <message>
 * 
 * If the log entry has a stack trace (i.e. it is an error), the stack
 * trace is included in the log message.
 * 
 * @returns {Logger} a logger instance
 */
const buildDevLogger = () => {

    const logFormat = printf(({ level, message, timestamp, stack }) => {

        return `${timestamp} ${level}: ${stack || message}`;
    });

    const fileTransport = new DailyRotateFile({

        filename: './src/logs/%DATE%.log',
        datePattern: 'YYYY_MM_DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFile: '14d',
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            logFormat
        )
    });

    return createLogger({
        
        transports: [
            new transports.Console(),
            fileTransport
        ]
    });
};

module.exports = buildDevLogger;