import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnterpriseClient, EnterpriseTier, EnterpriseStatus } from './entities/enterprise-client.entity';
import { Agency } from './entities/agency.entity';
import { AuditLog, AuditEventType, AuditEventResult } from './entities/audit-log.entity';
import { ComplianceRecord, ComplianceType, ComplianceStatus } from './entities/compliance-record.entity';
import { WhiteLabelConfig } from './entities/white-label-config.entity';
import { AuditService } from './audit.service';
import { ComplianceService } from './compliance.service';

@Injectable()
export class EnterpriseService {
  constructor(
    @InjectRepository(EnterpriseClient)
    private enterpriseClientRepository: Repository<EnterpriseClient>,
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
    @InjectRepository(WhiteLabelConfig)
    private whiteLabelConfigRepository: Repository<WhiteLabelConfig>,
    private auditService: AuditService,
    private complianceService: ComplianceService,
  ) {}

  // Enterprise Client Management
  async createEnterpriseClient(clientData: Partial<EnterpriseClient>): Promise<EnterpriseClient> {
    const client = this.enterpriseClientRepository.create(clientData);
    const savedClient = await this.enterpriseClientRepository.save(client);

    // Create initial compliance records
    await this.complianceService.createComplianceRecord({
      complianceType: ComplianceType.SOC2_TYPE_II,
      entityType: 'enterprise_client',
      entityId: savedClient.id,
      status: ComplianceStatus.PENDING_ASSESSMENT,
    });

    await this.auditService.logEvent({
      eventType: AuditEventType.ENTERPRISE_CLIENT_CREATED,
      userId: clientData.adminUser?.id,
      resource: 'enterprise_client',
      resourceId: savedClient.id,
      result: AuditEventResult.SUCCESS,
      description: `Enterprise client ${savedClient.companyName} created`,
      metadata: { clientData: savedClient },
    });

    return savedClient;
  }

  async getEnterpriseClient(id: string): Promise<EnterpriseClient> {
    const client = await this.enterpriseClientRepository.findOne({
      where: { id },
      relations: ['adminUser', 'agencies', 'whiteLabelConfig'],
    });

    if (!client) {
      throw new NotFoundException('Enterprise client not found');
    }

    return client;
  }

  async updateEnterpriseClient(id: string, updateData: Partial<EnterpriseClient>): Promise<EnterpriseClient> {
    const client = await this.getEnterpriseClient(id);
    
    const oldValues = { ...client };
    Object.assign(client, updateData);
    
    const savedClient = await this.enterpriseClientRepository.save(client);

    await this.auditService.logEvent({
      eventType: AuditEventType.ENTERPRISE_CLIENT_UPDATED,
      userId: updateData.adminUser?.id,
      resource: 'enterprise_client',
      resourceId: id,
      result: AuditEventResult.SUCCESS,
      description: `Enterprise client ${client.companyName} updated`,
      metadata: { oldValues, newValues: savedClient },
    });

    return savedClient;
  }

  async getEnterpriseClients(filters?: {
    tier?: EnterpriseTier;
    status?: EnterpriseStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ clients: EnterpriseClient[]; total: number }> {
    const query = this.enterpriseClientRepository.createQueryBuilder('client');

    if (filters?.tier) {
      query.andWhere('client.tier = :tier', { tier: filters.tier });
    }

    if (filters?.status) {
      query.andWhere('client.status = :status', { status: filters.status });
    }

    const total = await query.getCount();

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    if (filters?.offset) {
      query.offset(filters.offset);
    }

    const clients = await query
      .leftJoinAndSelect('client.adminUser', 'adminUser')
      .leftJoinAndSelect('client.agencies', 'agencies')
      .getMany();

    return { clients, total };
  }

  // Agency Management
  async createAgency(agencyData: Partial<Agency>): Promise<Agency> {
    const agency = this.agencyRepository.create(agencyData);
    const savedAgency = await this.agencyRepository.save(agency);

    await this.auditService.logEvent({
      eventType: AuditEventType.AGENCY_CREATED,
      userId: agencyData.adminUser?.id,
      resource: 'agency',
      resourceId: savedAgency.id,
      result: AuditEventResult.SUCCESS,
      description: `Agency ${savedAgency.name} created`,
      metadata: { agencyData: savedAgency },
    });

    return savedAgency;
  }

  async getAgency(id: string): Promise<Agency> {
    const agency = await this.agencyRepository.findOne({
      where: { id },
      relations: ['adminUser', 'enterpriseClient', 'sitters'],
    });

    if (!agency) {
      throw new NotFoundException('Agency not found');
    }

    return agency;
  }

  async updateAgency(id: string, updateData: Partial<Agency>): Promise<Agency> {
    const agency = await this.getAgency(id);
    
    const oldValues = { ...agency };
    Object.assign(agency, updateData);
    
    const savedAgency = await this.agencyRepository.save(agency);

    await this.auditService.logEvent({
      eventType: AuditEventType.AGENCY_UPDATED,
      userId: updateData.adminUser?.id,
      resource: 'agency',
      resourceId: id,
      result: AuditEventResult.SUCCESS,
      description: `Agency ${agency.name} updated`,
      metadata: { oldValues, newValues: savedAgency },
    });

    return savedAgency;
  }

  // White Label Management
  async createWhiteLabelConfig(configData: Partial<WhiteLabelConfig>): Promise<WhiteLabelConfig> {
    const config = this.whiteLabelConfigRepository.create(configData);
    return await this.whiteLabelConfigRepository.save(config);
  }

  async getWhiteLabelConfig(enterpriseClientId: string): Promise<WhiteLabelConfig> {
    const config = await this.whiteLabelConfigRepository.findOne({
      where: { enterpriseClient: { id: enterpriseClientId } },
      relations: ['enterpriseClient'],
    });

    if (!config) {
      throw new NotFoundException('White label configuration not found');
    }

    return config;
  }

  async updateWhiteLabelConfig(enterpriseClientId: string, updateData: Partial<WhiteLabelConfig>): Promise<WhiteLabelConfig> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    Object.assign(config, updateData);
    return await this.whiteLabelConfigRepository.save(config);
  }

  // Analytics and Reporting
  async getEnterpriseAnalytics(enterpriseClientId: string, period: string = 'month') {
    const client = await this.getEnterpriseClient(enterpriseClientId);
    
    // Get analytics data for the enterprise client
    const analytics = {
      totalUsers: 0,
      totalBookings: 0,
      totalRevenue: 0,
      activeAgencies: 0,
      complianceScore: 0,
      lastUpdated: new Date(),
    };

    // Calculate compliance score
    const complianceRecords = await this.complianceService.getComplianceRecords(
      'enterprise_client',
      enterpriseClientId
    );
    
    const compliantRecords = complianceRecords.filter(record => 
      record.status === ComplianceStatus.COMPLIANT
    );
    
    analytics.complianceScore = complianceRecords.length > 0 
      ? (compliantRecords.length / complianceRecords.length) * 100 
      : 0;

    return analytics;
  }

  // Billing and Subscription Management
  async updateSubscription(enterpriseClientId: string, subscriptionData: {
    tier: EnterpriseTier;
    monthlyFee: number;
    transactionFee: number;
    contractStartDate: Date;
    contractEndDate: Date;
  }): Promise<EnterpriseClient> {
    const client = await this.getEnterpriseClient(enterpriseClientId);
    
    Object.assign(client, subscriptionData);
    
    return await this.enterpriseClientRepository.save(client);
  }

  // Feature Management
  async updateFeatureAccess(enterpriseClientId: string, features: {
    enabledFeatures: string[];
    disabledFeatures: string[];
    restrictions: Record<string, any>;
  }): Promise<EnterpriseClient> {
    const client = await this.getEnterpriseClient(enterpriseClientId);
    
    client.settings = {
      ...client.settings,
      features: features.enabledFeatures,
      restrictions: features.restrictions,
    };
    
    return await this.enterpriseClientRepository.save(client);
  }
}

