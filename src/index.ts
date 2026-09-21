import express, {type Request, type Response, type NextFunction, type Errback} from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import probRouter from './routes/problems.js'
import userRouter from './routes/user.js';
import adminAuthRouter from "./routes/adminAuth.js"
import adminProbRouter from './routes/adminProb.js'
import { authMiddleware } from './middleware/auth.js'

const app = express();

app.get('/', (_req, res) => {
    return res.send('Server Healthy')
})

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}))

app.use('/api/auth/users', userRouter);
app.use('/api/auth/admin', adminAuthRouter);
app.use('/api/problems', authMiddleware, probRouter);
app.use('/api/admin/problems', authMiddleware, adminProbRouter);

app.use((err: Errback, _req: Request, res: Response, _next: NextFunction) => {
    return res.status(500).json({
        status: false,
        message: 'Internal Server Error',
        error: err
    });
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})