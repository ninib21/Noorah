import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function runSeed() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('Seeding completed successfully');
    await app.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeed(); 
