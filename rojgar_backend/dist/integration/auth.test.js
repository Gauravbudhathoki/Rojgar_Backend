"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
// import app
const user_model_1 = require("../models/user.model");
describe('Authentication Integration Tests', // Test Suite/Group name
() => {
    const testUser = {
        'email': 'test@example.com',
        'password': 'Test@1234',
        'username': 'testuser',
        'firstName': 'Test',
        'lastName': 'User'
    };
    beforeAll(async () => {
        // Ensure the test user does not exist before tests
        await user_model_1.UserModel.deleteMany({ email: testUser.email });
    });
    afterAll(async () => {
        // Clean up the test user after tests
        await user_model_1.UserModel.deleteMany({ email: testUser.email });
    });
    describe('POST /api/auth/register', // Test Case name
    () => {
        test('should register a new user successfully', // Test name
        async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(testUser);
            // Validate response structure
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'User registered successfully');
            expect(response.body).toHaveProperty('data');
        });
    });
});
//# sourceMappingURL=auth.test.js.map