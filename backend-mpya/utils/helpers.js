const generateBookingReference = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^\+?[0-9]{10,15}$/;
  return re.test(phone);
};

const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    meta: {
      total: array.length,
      page,
      limit,
      totalPages: Math.ceil(array.length / limit),
      hasNext: endIndex < array.length,
      hasPrev: startIndex > 0
    }
  };
};

module.exports = {
  generateBookingReference,
  validateEmail,
  validatePhone,
  paginate
};