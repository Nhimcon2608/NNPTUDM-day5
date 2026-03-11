const express = require('express');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const notFound = require('./middlewares/not-found');
const errorHandler = require('./middlewares/error-handler');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'User/Role API is running.' });
});

app.use('/users', userRoutes);
app.use('/roles', roleRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
