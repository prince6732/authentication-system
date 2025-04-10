const notFound = (req, res, next) => {
  const error = new Error(`Not Found`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error!" });
};

module.exports = {
  errorHandler,
  notFound,
};
