import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { AgencyService } from './agency.service';
import { WhiteLabelService } from './white-label.service';
import { ComplianceService } from './compliance.service';
import { AuditService } from './audit.service';
import { EnterpriseClient } from './entities/enterprise-client.entity';
import { Agency } from './entities/agency.entity';
import { AuditLog } from './entities/audit-log.entity';
import { ComplianceRecord } from './entities/compliance-record.entity';
import { WhiteLabelConfig } from './entities/white-label-config.entity';
import { SitterProfile } from '../entities/sitter-profile.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EnterpriseClient,
      Agency,
      AuditLog,
      ComplianceRecord,
      WhiteLabelConfig,
      SitterProfile,
      User,
    ]),
  ],
  controllers: [EnterpriseController],
  providers: [
    EnterpriseService,
    AgencyService,
    WhiteLabelService,
    ComplianceService,
    AuditService,
  ],
  exports: [
    EnterpriseService,
    AgencyService,
    WhiteLabelService,
    ComplianceService,
    AuditService,
  ],
})
export class EnterpriseModule {}

