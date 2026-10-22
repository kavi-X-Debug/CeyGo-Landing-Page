// 404 for unknown API routes.
export function notFound(req, res) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
}

// Centralised error handler. Never leaks stack traces in production.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const body = { error: status === 500 ? 'Internal server error' : err.message };
  if (process.env.NODE_ENV !== 'production') body.detail = err.message;
  if (status === 500) console.error(err);
  res.status(status).json(body);
}
