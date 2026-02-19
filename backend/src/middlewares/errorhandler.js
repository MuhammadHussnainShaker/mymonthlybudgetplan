export default function errorHandler(err, req, res, next) {
  console.error(err)

  if (res.headersSent) return next(err)

  const status = err.statusCode || 500
  const payload = {
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
  }
  if (process.env.NODE_ENV === 'development') payload.stack = err.stack

  res.status(status).json(payload)
}
