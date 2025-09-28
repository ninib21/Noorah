import { Module } from '@nestjs/common';
import { QuantumAgentCoordinatorService } from './quantum-agent-coordinator.service';
import { AquaFlowTeamService } from './aqua-flow-team.service';
import { QuantumAlgorithmService } from './quantum-algorithm.service';
import { QuantumDataScienceService } from './quantum-datascience.service';
import { QuantumAgentExecutionController } from './quantum-agent-execution.controller';

@Module({
  controllers: [QuantumAgentExecutionController],
  providers: [
    QuantumAgentCoordinatorService,
    AquaFlowTeamService,
    QuantumAlgorithmService,
    QuantumDataScienceService,
  ],
  exports: [
    QuantumAgentCoordinatorService,
    AquaFlowTeamService,
    QuantumAlgorithmService,
    QuantumDataScienceService,
  ],
})
export class AgentsModule {}

