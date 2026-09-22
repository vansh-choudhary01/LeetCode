import express, {type Request, type Response, type NextFunction, type Errback} from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import userRouter from "./routes/user.js"
import userAuthRouter from './routes/userAuth.js';
import probRouter from './routes/problems.js'
import adminAuthRouter from "./routes/adminAuth.js"
import adminProbRouter from './routes/adminProb.js'
import { authMiddleware } from './middleware/auth.js'
import cookie_parser from "cookie-parser";

const app = express();

app.get('/', (_req, res) => {
    return res.send('Server Healthy')
})

app.use(express.json());
app.use(cookie_parser());
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'METHOD']
}))

app.use('/api/auth/user', userAuthRouter);
app.use('/api/auth/admin', adminAuthRouter);
app.use('/api/problems', authMiddleware, probRouter);
app.use('/api/admin/problems', authMiddleware, adminProbRouter);
app.use('/api', authMiddleware, userRouter);

app.use((err: Errback, _req: Request, res: Response, _next: NextFunction) => {
    console.log(err);
    return res.status(500).json({
        status: false,
        message: 'Internal Server Error',
        error: err.toString()
    });
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})