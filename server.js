// server.js
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.use('/', routes);

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});
