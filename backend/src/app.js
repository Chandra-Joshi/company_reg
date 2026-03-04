import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import { initDB } from './data/database.js';
import companyRoutes from './routes/companyRoutes.js';
import shareholderRoutes from './routes/shareholderRoutes.js';
import logger from './middlewares/logger.js';
const app = express();

// Middleware
const allowAllOrigins = config.clientOrigins.includes('*');
const allowedOriginSet = new Set(config.clientOrigins);

app.use(
    cors({
        origin(origin, callback) {
            if (allowAllOrigins || !origin || allowedOriginSet.has(origin)) {
                return callback(null, true);
            }
            console.warn(`Blocked CORS origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'));
        },
    })
);
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/companies', companyRoutes);
app.use('/api/companies/:id/shareholders', shareholderRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize DB and start server
initDB().then(() => {
    app.listen(config.port, () => {
        console.log(`Server running on http://localhost:${config.port}`);
    });
});
