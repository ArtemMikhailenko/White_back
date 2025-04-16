// src/app.module.ts
import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('MongooseModule');
        const uri = configService.get<string>('MONGODB_URI', 'mongodb+srv://artemlend:1234@cluster0.38f7t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        
        logger.log(`Connecting to MongoDB database`);
        
        return {
          uri,
          // Современные настройки без устаревших параметров
          useNewUrlParser: true,
          useUnifiedTopology: true,
          connectTimeoutMS: 10000, // 10 секунд на подключение
          socketTimeoutMS: 45000, // 45 секунд на операции
          serverSelectionTimeoutMS: 5000, // 5 секунд на выбор сервера
          // Правильные настройки пула соединений для MongoDB 4.x/5.x
          maxConnecting: 2,
          maxPoolSize: 5, // Вместо устаревшего poolSize
          minPoolSize: 1,
          // Фабрика подключения для логгирования
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              logger.log('Successfully connected to MongoDB');
            });
            
            connection.on('disconnected', () => {
              logger.warn('Disconnected from MongoDB');
            });
            
            connection.on('error', (error) => {
              logger.error(`MongoDB connection error: ${error.message}`);
            });
            
            return connection;
          },
        };
      },
    }),
    WalletModule,
  ],
})
export class AppModule {}