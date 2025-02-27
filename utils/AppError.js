class AppError extends Error  {
   constructor (message,status){
      super();
      this.message = message
      this.status = status
   }
  }
  
  module.exports = AppError










// class AppError extends Error {
//   constructor(message, statusCode) {
//       super(message); // Pass the error message to the parent Error class

//       this.statusCode = statusCode || 500; // Default to 500 if no status is provided
//       this.status = statusCode < 400 ? 'success' : 'error'; // Set status based on the statusCode
//       this.isOperational = true; // Mark as an operational error

//       // Captures the stack trace, but excludes this constructor from the trace
//       Error.captureStackTrace(this, this.constructor);
//   }
// }

// module.exports = AppError;








