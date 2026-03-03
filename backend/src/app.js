import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import { initDB } from './data/database.js';
import companyRoutes from './routes/companyRoutes.js';
import shareholderRoutes from './routes/shareholderRoutes.js';
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

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
