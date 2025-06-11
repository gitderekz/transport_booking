const { upload } = require('../config/multer');
const { ApiError } = require('../utils/errorHandler');

const handleUpload = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'File size too large. Maximum 10MB allowed.'));
        }
        if (err.message.includes('Invalid file type')) {
          return next(new ApiError(400, 'Invalid file type. Only JPEG, PNG and GIF are allowed.'));
        }
        return next(new ApiError(500, 'File upload failed'));
      }
      next();
    });
  };
};

module.exports = {
  handleUpload
};