import express from 'express';

const app = express();

app.use(express.json());

const port = 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});