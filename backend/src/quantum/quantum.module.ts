import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuantumSimpleService } from './quantum-simple.service';
import { QuantumSimpleController } from './quantum-simple.controller';

/**
 * Quantum Module
 * 
 * Integrates quantum computing features:
 * - Quantum Sitter Matching
 * - Quantum Key Generation
 * - Quantum Analytics
 * - Quantum Optimization
 * - Quantum Communication
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([]), // Add entities if needed
  ],
  controllers: [QuantumSimpleController],
  providers: [
    QuantumSimpleService,
  ],
  exports: [
    QuantumSimpleService,
  ],
})
export class QuantumModule {}

