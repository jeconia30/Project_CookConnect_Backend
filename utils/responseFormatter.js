const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    code: statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    code: statusCode,
    message,
    errors: errors || null,
    timestamp: new Date().toISOString(),
  });
};

const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    code: 400,
    message: 'Validation Error',
    errors, // { field: 'error message' }
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
};