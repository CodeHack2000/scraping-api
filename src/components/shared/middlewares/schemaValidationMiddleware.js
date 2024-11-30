module.exports = (schema, property = 'body') => {

    return (req, res, next) => {

        const { error } = schema.validate(req[property], { abortEarly: false });

        if (error) {

            return res
                .status(400)
                .json({
                    message: 'Validation error',
                    details: error.details.map((detail) => detail.message)
                });
        }

        next();
    };
};