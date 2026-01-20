import dotenv from 'dotenv';

dotenv.config();

const PORT_ENV = process.env.PORT;
const MONGODB_URI_ENV = process.env.MONGODB_URI;

const JWT_SECRET_ENV = process.env.JWT_SECRET;

if (!MONGODB_URI_ENV) {
  throw new Error('MONGODB_URI is not defined in environment');
}

export const PORT_NUMBER = PORT_ENV ? Number(PORT_ENV) : 3000;
export const MONGODB_URI = MONGODB_URI_ENV;
export const JWT_SECRET = JWT_SECRET_ENV ? JWT_SECRET_ENV : 'change_this_secret';
