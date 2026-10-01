const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value entered.',
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Resource not found with id of ${err.value}`,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;