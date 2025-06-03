class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, null, message));
};

module.exports = {
  ApiResponse,
  successResponse,
  errorResponse
};