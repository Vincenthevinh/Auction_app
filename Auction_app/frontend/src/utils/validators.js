export const validateProductForm = (data) => {
  const errors = {};

  if (!data.title?.trim()) errors.title = 'Title is required';
  if (!data.category) errors.category = 'Category is required';
  if (!data.condition) errors.condition = 'Condition is required';
  if (!data.startPrice || data.startPrice <= 0) errors.startPrice = 'Valid start price required';
  if (!data.startTime) errors.startTime = 'Start time is required';
  if (!data.endTime) errors.endTime = 'End time is required';
  if (new Date(data.endTime) <= new Date(data.startTime)) {
    errors.endTime = 'End time must be after start time';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const validateBidAmount = (currentPrice, minIncrement, bidAmount) => {
  const minBidAmount = currentPrice + minIncrement;
  if (bidAmount < minBidAmount) {
    return `Bid must be at least ${minBidAmount}`;
  }
  return null;
};