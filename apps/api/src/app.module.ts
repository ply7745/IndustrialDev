import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductionModule } from './modules/production/production.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { QualityModule } from './modules/quality/quality.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { CompanyModule } from './modules/company/company.module';
import { PositionModule } from './modules/position/position.module';
import { SalaryModule } from './modules/salary/salary.module';
import { ApplicationModule } from './modules/application/application.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get('DB_TYPE', 'sqlite');
        
        const sqliteConfig: any = {
          type: 'sqljs',
          location: config.get('DB_PATH', 'data/industrial_dev.db'),
          autoSave: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: config.get('NODE_ENV') !== 'production',
          logging: config.get('NODE_ENV') === 'development',
        };
        
        const mysqlConfig: any = {
          type: 'mysql',
          host: config.get('DB_HOST', 'localhost'),
          port: parseInt(config.get('DB_PORT', '3306')),
          username: config.get('DB_USER', 'root'),
          password: config.get('DB_PASSWORD', ''),
          database: config.get('DB_NAME', 'industrial_dev'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: config.get('NODE_ENV') !== 'production',
          logging: config.get('NODE_ENV') === 'development',
        };
        
        const postgresConfig: any = {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: parseInt(config.get('DB_PORT', '5432')),
          username: config.get('DB_USER', 'postgres'),
          password: config.get('DB_PASSWORD', ''),
          database: config.get('DB_NAME', 'industrial_dev'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: config.get('NODE_ENV') !== 'production',
          logging: config.get('NODE_ENV') === 'development',
        };
        
        if (dbType === 'sqlite') return sqliteConfig;
        if (dbType === 'postgres') return postgresConfig;
        return mysqlConfig;
      },
    }),
    ProductionModule,
    InventoryModule,
    EquipmentModule,
    QualityModule,
    EmployeeModule,
    CompanyModule,
    PositionModule,
    SalaryModule,
    ApplicationModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}