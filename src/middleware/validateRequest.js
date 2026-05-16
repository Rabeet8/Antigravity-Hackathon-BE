/**
 * Middleware to validate the NER extraction request
 */
const validateNERRequest = (req, res, next) => {
  const { message } = req.body;

  if (message === undefined) {
    return res.status(400).json({
      success: false,
      error: "Message is required"
    });
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Message cannot be empty"
    });
  }

  // Attach sanitized message to req for later use
  req.sanitizedMessage = message.trim();
  next();
};

module.exports = {
  validateNERRequest,
};
