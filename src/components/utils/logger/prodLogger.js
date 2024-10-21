const { format, createLogger, transports } = require('winston');
const { timestamp, combine, errors, json } = format;
const DailyRotateFile = require('winston-daily-rotate-file');

/**
 * Builds a logger that logs messages in the format
 * 
 *   {"timestamp": <timestamp>, "level": <level>, "message": <message>}
 * 
 * If the log entry has a stack trace (i.e. it is an error), the stack
 * trace is not included in the log message.
 * 
 * @returns {Logger} a logger instance
 */
const buildProdLogger = () => {

    const fileTransport = new DailyRotateFile({

        filename: './src/logs/%DATE%.log',
        datePattern: 'YYYY_MM_DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFile: '14d',
        format: combine(
            timestamp(),
            errors({ stack: false }),
            json()
        )
    });

    return createLogger({

        format: combine(
            timestamp(),
            errors({ stack: false }),
            json()
        ),
        transports: [
            new transports.Console(),
            fileTransport
        ]
    });
};

module.exports = buildProdLogger;