import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import carRoutes from './routes/carRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import reservationRoutes from './routes/reservationRoutes';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerFile = path.resolve(__dirname, './swagger.json');
const swaggerData = fs.readFileSync(swaggerFile, 'utf8');
const swaggerDocument = JSON.parse(swaggerData);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use('/api/v1', carRoutes);
app.use(express.json());
app.use('/api/v1', userRoutes);
app.use(express.json());
app.use('/api/v1', authRoutes);
app.use(express.json());
app.use('/api/v1', reservationRoutes);

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/flexilease';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
