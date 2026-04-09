import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dbType = process.env.DB_TYPE || 'sqlite';

export const AppDataSource = new DataSource(
  dbType === 'sqlite'
    ? {
        type: 'sqljs',
        location: process.env.DB_PATH || 'data/industrial_dev.db',
        autoSave: true,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        entities: ['src/entities/**/*.ts'],
        migrations: ['src/migrations/**/*.ts'],
      }
    : {
        type: dbType === 'postgres' ? 'postgres' : 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'industrial_dev',
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        entities: ['src/entities/**/*.ts'],
        migrations: ['src/migrations/**/*.ts'],
      }
);