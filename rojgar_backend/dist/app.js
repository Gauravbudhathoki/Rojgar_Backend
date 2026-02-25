"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const app = (0, express_1.default)();
// CORS setup
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3003',
        'http://localhost:3005',
        'http://192.168.18.4:5050',
        'http://127.0.0.1:5050',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
// Body parser
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Logger middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// Static folders
app.use('/profile_pictures', express_1.default.static(path_1.default.join(process.cwd(), 'public/profile_pictures')));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Routes
app.use('/api/auth', auth_route_1.default);
// Default endpoint
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: "GoalNepal API is running" });
});
exports.default = app;
//# sourceMappingURL=app.js.map