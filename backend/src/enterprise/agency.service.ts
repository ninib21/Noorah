import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency, AgencyTier, AgencyStatus } from './entities/agency.entity';
import { SitterProfile } from '../entities/sitter-profile.entity';
import { User } from '../entities/user.entity';
import { AuditService } from './audit.service';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
    @InjectRepository(SitterProfile)
    private sitterProfileRepository: Repository<SitterProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async createAgency(agencyData: Partial<Agency>): Promise<Agency> {
    // Validate admin user exists
    if (agencyData.adminUser?.id) {
      const adminUser = await this.userRepository.findOne({
        where: { id: agencyData.adminUser.id },
      });
      if (!adminUser) {
        throw new BadRequestException('Admin user not found');
      }
    }

    const agency = this.agencyRepository.create(agencyData);
    const savedAgency = await this.agencyRepository.save(agency);

    await this.auditService.logEvent({
      eventType: 'AGENCY_CREATED' as any,
      userId: agencyData.adminUser?.id,
      resource: 'agency',
      resourceId: savedAgency.id,
      result: 'success' as any,
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

  async getAgencyBySlug(slug: string): Promise<Agency> {
    const agency = await this.agencyRepository.findOne({
      where: { slug },
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
      eventType: 'AGENCY_UPDATED' as any,
      userId: updateData.adminUser?.id,
      resource: 'agency',
      resourceId: id,
      result: 'success' as any,
      description: `Agency ${agency.name} updated`,
      metadata: { oldValues, newValues: savedAgency },
    });

    return savedAgency;
  }

  async getAgencies(filters?: {
    tier?: AgencyTier;
    status?: AgencyStatus;
    enterpriseClientId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ agencies: Agency[]; total: number }> {
    const query = this.agencyRepository.createQueryBuilder('agency');

    if (filters?.tier) {
      query.andWhere('agency.tier = :tier', { tier: filters.tier });
    }

    if (filters?.status) {
      query.andWhere('agency.status = :status', { status: filters.status });
    }

    if (filters?.enterpriseClientId) {
      query.andWhere('agency.enterpriseClientId = :enterpriseClientId', { 
        enterpriseClientId: filters.enterpriseClientId 
      });
    }

    const total = await query.getCount();

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    if (filters?.offset) {
      query.offset(filters.offset);
    }

    const agencies = await query
      .leftJoinAndSelect('agency.adminUser', 'adminUser')
      .leftJoinAndSelect('agency.enterpriseClient', 'enterpriseClient')
      .leftJoinAndSelect('agency.sitters', 'sitters')
      .getMany();

    return { agencies, total };
  }

  async addSitterToAgency(agencyId: string, sitterId: string): Promise<Agency> {
    const agency = await this.getAgency(agencyId);
    const sitter = await this.sitterProfileRepository.findOne({
      where: { id: sitterId },
      relations: ['user'],
    });

    if (!sitter) {
      throw new NotFoundException('Sitter not found');
    }

    // Check if agency has reached maximum sitters
    if (agency.settings?.maxSitters && agency.sitters.length >= agency.settings.maxSitters) {
      throw new BadRequestException('Agency has reached maximum sitter limit');
    }

    sitter.agencyId = agency.id;
    await this.sitterProfileRepository.save(sitter);

    await this.auditService.logEvent({
      eventType: 'SITTER_ADDED_TO_AGENCY' as any,
      userId: sitter.user?.id,
      resource: 'agency',
      resourceId: agencyId,
      result: 'success' as any,
      description: `Sitter ${sitter.user?.firstName} ${sitter.user?.lastName} added to agency ${agency.name}`,
      metadata: { sitterId, agencyId },
    });

    return await this.getAgency(agencyId);
  }

  async removeSitterFromAgency(agencyId: string, sitterId: string): Promise<Agency> {
    const agency = await this.getAgency(agencyId);
    const sitter = await this.sitterProfileRepository.findOne({
      where: { id: sitterId, agencyId: agencyId },
      relations: ['user'],
    });

    if (!sitter) {
      throw new NotFoundException('Sitter not found in agency');
    }

    sitter.agencyId = undefined;
    await this.sitterProfileRepository.save(sitter);

    await this.auditService.logEvent({
      eventType: 'SITTER_REMOVED_FROM_AGENCY' as any,
      userId: sitter.user?.id,
      resource: 'agency',
      resourceId: agencyId,
      result: 'success' as any,
      description: `Sitter ${sitter.user?.firstName} ${sitter.user?.lastName} removed from agency ${agency.name}`,
      metadata: { sitterId, agencyId },
    });

    return await this.getAgency(agencyId);
  }

  async updateAgencyBranding(agencyId: string, branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    customCSS?: string;
  }): Promise<Agency> {
    const agency = await this.getAgency(agencyId);
    
    agency.branding = {
      ...agency.branding,
      ...branding,
    };

    const savedAgency = await this.agencyRepository.save(agency);

    await this.auditService.logEvent({
      eventType: 'AGENCY_BRANDING_UPDATED' as any,
      userId: agency.adminUser?.id,
      resource: 'agency',
      resourceId: agencyId,
      result: 'success' as any,
      description: `Agency branding updated for ${agency.name}`,
      metadata: { branding },
    });

    return savedAgency;
  }

  async updateAgencySettings(agencyId: string, settings: {
    maxSitters?: number;
    maxBookings?: number;
    features?: string[];
    restrictions?: Record<string, any>;
    workflows?: Record<string, any>;
  }): Promise<Agency> {
    const agency = await this.getAgency(agencyId);
    
    agency.settings = {
      ...agency.settings,
      ...settings,
    };

    const savedAgency = await this.agencyRepository.save(agency);

    await this.auditService.logEvent({
      eventType: 'AGENCY_SETTINGS_UPDATED' as any,
      userId: agency.adminUser?.id,
      resource: 'agency',
      resourceId: agencyId,
      result: 'success' as any,
      description: `Agency settings updated for ${agency.name}`,
      metadata: { settings },
    });

    return savedAgency;
  }

  async getAgencyAnalytics(agencyId: string, period: string = 'month'): Promise<{
    totalSitters: number;
    activeSitters: number;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    topSitters: Array<{ sitterId: string; name: string; rating: number; bookings: number }>;
    bookingTrends: Array<{ date: string; bookings: number; revenue: number }>;
  }> {
    const agency = await this.getAgency(agencyId);
    
    const analytics = {
      totalSitters: agency.sitters.length,
      activeSitters: agency.sitters.filter(sitter => sitter.isAvailable).length,
      totalBookings: 0,
      totalRevenue: 0,
      averageRating: 0,
      topSitters: [],
      bookingTrends: [],
    };

    // Calculate additional analytics based on agency data
    // This would typically involve more complex queries to get booking and revenue data

    return analytics;
  }

  async suspendAgency(agencyId: string, reason: string): Promise<Agency> {
    const agency = await this.getAgency(agencyId);
    
    agency.status = AgencyStatus.SUSPENDED;
    const savedAgency = await this.agencyRepository.save(agency);

    await this.auditService.logEvent({
      eventType: 'AGENCY_SUSPENDED' as any,
      userId: agency.adminUser?.id,
      resource: 'agency',
      resourceId: agencyId,
      result: 'success' as any,
      description: `Agency ${agency.name} suspended: ${reason}`,
      metadata: { reason },
    });

    return savedAgency;
  }

  async activateAgency(agencyId: string): Promise<Agency> {
    const agency = await this.getAgency(agencyId);
    
    agency.status = AgencyStatus.ACTIVE;
    const savedAgency = await this.agencyRepository.save(agency);

    await this.auditService.logEvent({
      eventType: 'AGENCY_ACTIVATED' as any,
      userId: agency.adminUser?.id,
      resource: 'agency',
      resourceId: agencyId,
      result: 'success' as any,
      description: `Agency ${agency.name} activated`,
    });

    return savedAgency;
  }

  async updateSubscription(agencyId: string, subscriptionData: {
    tier: AgencyTier;
    monthlyFee: number;
    commissionRate: number;
    subscriptionStartDate: Date;
    subscriptionEndDate: Date;
  }): Promise<Agency> {
    const agency = await this.getAgency(agencyId);
    
    Object.assign(agency, subscriptionData);
    
    const savedAgency = await this.agencyRepository.save(agency);

    await this.auditService.logEvent({
      eventType: 'AGENCY_SUBSCRIPTION_UPDATED' as any,
      userId: agency.adminUser?.id,
      resource: 'agency',
      resourceId: agencyId,
      result: 'success' as any,
      description: `Agency subscription updated for ${agency.name}`,
      metadata: { subscriptionData },
    });

    return savedAgency;
  }
}

