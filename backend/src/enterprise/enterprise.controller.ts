import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EnterpriseService } from './enterprise.service';
import { AgencyService } from './agency.service';
import { WhiteLabelService } from './white-label.service';
import { ComplianceService } from './compliance.service';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Enterprise')
@Controller('enterprise')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EnterpriseController {
  constructor(
    private enterpriseService: EnterpriseService,
    private agencyService: AgencyService,
    private whiteLabelService: WhiteLabelService,
    private complianceService: ComplianceService,
    private auditService: AuditService,
  ) {}

  // Enterprise Client Management
  @Post('clients')
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Create enterprise client' })
  @ApiResponse({ status: 201, description: 'Enterprise client created successfully' })
  async createEnterpriseClient(@Body() clientData: any) {
    return await this.enterpriseService.createEnterpriseClient(clientData);
  }

  @Get('clients')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Get enterprise clients' })
  @ApiQuery({ name: 'tier', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getEnterpriseClients(
    @Query('tier') tier?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.enterpriseService.getEnterpriseClients({
      tier: tier as any,
      status: status as any,
      limit,
      offset,
    });
  }

  @Get('clients/:id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Get enterprise client by ID' })
  async getEnterpriseClient(@Param('id') id: string) {
    return await this.enterpriseService.getEnterpriseClient(id);
  }

  @Put('clients/:id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Update enterprise client' })
  async updateEnterpriseClient(@Param('id') id: string, @Body() updateData: any) {
    return await this.enterpriseService.updateEnterpriseClient(id, updateData);
  }

  @Get('clients/:id/analytics')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Get enterprise client analytics' })
  @ApiQuery({ name: 'period', required: false, default: 'month' })
  async getEnterpriseAnalytics(
    @Param('id') id: string,
    @Query('period') period: string = 'month',
  ) {
    return await this.enterpriseService.getEnterpriseAnalytics(id, period);
  }

  // Agency Management
  @Post('agencies')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Create agency' })
  async createAgency(@Body() agencyData: any) {
    return await this.agencyService.createAgency(agencyData);
  }

  @Get('agencies')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN, UserRole.AGENCY_ADMIN)
  @ApiOperation({ summary: 'Get agencies' })
  @ApiQuery({ name: 'tier', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'enterpriseClientId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getAgencies(
    @Query('tier') tier?: string,
    @Query('status') status?: string,
    @Query('enterpriseClientId') enterpriseClientId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.agencyService.getAgencies({
      tier: tier as any,
      status: status as any,
      enterpriseClientId,
      limit,
      offset,
    });
  }

  @Get('agencies/:id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN, UserRole.AGENCY_ADMIN)
  @ApiOperation({ summary: 'Get agency by ID' })
  async getAgency(@Param('id') id: string) {
    return await this.agencyService.getAgency(id);
  }

  @Put('agencies/:id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN, UserRole.AGENCY_ADMIN)
  @ApiOperation({ summary: 'Update agency' })
  async updateAgency(@Param('id') id: string, @Body() updateData: any) {
    return await this.agencyService.updateAgency(id, updateData);
  }

  @Post('agencies/:id/sitters/:sitterId')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN, UserRole.AGENCY_ADMIN)
  @ApiOperation({ summary: 'Add sitter to agency' })
  async addSitterToAgency(
    @Param('id') agencyId: string,
    @Param('sitterId') sitterId: string,
  ) {
    return await this.agencyService.addSitterToAgency(agencyId, sitterId);
  }

  @Delete('agencies/:id/sitters/:sitterId')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN, UserRole.AGENCY_ADMIN)
  @ApiOperation({ summary: 'Remove sitter from agency' })
  async removeSitterFromAgency(
    @Param('id') agencyId: string,
    @Param('sitterId') sitterId: string,
  ) {
    return await this.agencyService.removeSitterFromAgency(agencyId, sitterId);
  }

  @Get('agencies/:id/analytics')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN, UserRole.AGENCY_ADMIN)
  @ApiOperation({ summary: 'Get agency analytics' })
  @ApiQuery({ name: 'period', required: false, default: 'month' })
  async getAgencyAnalytics(
    @Param('id') id: string,
    @Query('period') period: string = 'month',
  ) {
    return await this.agencyService.getAgencyAnalytics(id, period);
  }

  // White Label Management
  @Post('white-label')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Create white label configuration' })
  async createWhiteLabelConfig(@Body() configData: any) {
    return await this.whiteLabelService.createWhiteLabelConfig(configData);
  }

  @Get('white-label/:enterpriseClientId')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Get white label configuration' })
  async getWhiteLabelConfig(@Param('enterpriseClientId') enterpriseClientId: string) {
    return await this.whiteLabelService.getWhiteLabelConfig(enterpriseClientId);
  }

  @Put('white-label/:enterpriseClientId')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Update white label configuration' })
  async updateWhiteLabelConfig(
    @Param('enterpriseClientId') enterpriseClientId: string,
    @Body() updateData: any,
  ) {
    return await this.whiteLabelService.updateWhiteLabelConfig(enterpriseClientId, updateData);
  }

  @Put('white-label/:enterpriseClientId/branding')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Update white label branding' })
  async updateWhiteLabelBranding(
    @Param('enterpriseClientId') enterpriseClientId: string,
    @Body() branding: any,
  ) {
    return await this.whiteLabelService.updateBranding(enterpriseClientId, branding);
  }

  @Put('white-label/:enterpriseClientId/content')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Update white label content' })
  async updateWhiteLabelContent(
    @Param('enterpriseClientId') enterpriseClientId: string,
    @Body() content: any,
  ) {
    return await this.whiteLabelService.updateContent(enterpriseClientId, content);
  }

  @Post('white-label/:enterpriseClientId/activate')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Activate white label configuration' })
  async activateWhiteLabel(@Param('enterpriseClientId') enterpriseClientId: string) {
    return await this.whiteLabelService.activateWhiteLabel(enterpriseClientId);
  }

  @Post('white-label/:enterpriseClientId/deactivate')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Deactivate white label configuration' })
  async deactivateWhiteLabel(@Param('enterpriseClientId') enterpriseClientId: string) {
    return await this.whiteLabelService.deactivateWhiteLabel(enterpriseClientId);
  }

  @Get('white-label/:enterpriseClientId/assets')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Generate white label theme assets' })
  async generateThemeAssets(@Param('enterpriseClientId') enterpriseClientId: string) {
    return await this.whiteLabelService.generateThemeAssets(enterpriseClientId);
  }

  // Compliance Management
  @Get('compliance/dashboard')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Get compliance dashboard' })
  async getComplianceDashboard() {
    return await this.complianceService.getComplianceDashboard();
  }

  @Get('compliance/records')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Get compliance records' })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'complianceType', required: false })
  async getComplianceRecords(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('complianceType') complianceType?: string,
  ) {
    if (entityType && entityId) {
      return await this.complianceService.getComplianceRecords(entityType, entityId, complianceType as any);
    }
    return await this.complianceService.getComplianceReport(entityType, entityId, complianceType as any);
  }

  @Post('compliance/records')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Create compliance record' })
  async createComplianceRecord(@Body() recordData: any) {
    return await this.complianceService.createComplianceRecord(recordData);
  }

  @Put('compliance/records/:id')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Update compliance record' })
  async updateComplianceRecord(@Param('id') id: string, @Body() updateData: any) {
    return await this.complianceService.updateComplianceRecord(id, updateData);
  }

  @Post('compliance/records/:id/assess')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Assess compliance record' })
  async assessCompliance(@Param('id') id: string, @Body() assessmentData: any) {
    const record = await this.complianceService.getComplianceRecord(id);
    return await this.complianceService.assessCompliance(
      record.entityType,
      record.entityId,
      record.complianceType,
      assessmentData,
    );
  }

  @Post('compliance/records/:id/remediation')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Create remediation plan' })
  async createRemediationPlan(@Param('id') id: string, @Body() remediationData: any) {
    return await this.complianceService.createRemediationPlan(id, remediationData);
  }

  // Audit Management
  @Get('audit/logs')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'eventType', required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'resourceId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('eventType') eventType?: string,
    @Query('resource') resource?: string,
    @Query('resourceId') resourceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.auditService.getAuditLogs({
      userId,
      eventType: eventType as any,
      resource,
      resourceId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });
  }

  @Get('audit/summary')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Get audit summary' })
  @ApiQuery({ name: 'period', required: false, default: 'month' })
  async getAuditSummary(@Query('period') period: string = 'month') {
    return await this.auditService.getAuditSummary(period);
  }

  @Post('audit/export')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Export audit logs' })
  @HttpCode(HttpStatus.OK)
  async exportAuditLogs(
    @Body() filters: {
      startDate?: string;
      endDate?: string;
      format: 'csv' | 'json' | 'pdf';
    },
  ) {
    const buffer = await this.auditService.exportAuditLogs({
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      format: filters.format,
    });

    return {
      data: buffer.toString('base64'),
      format: filters.format,
      size: buffer.length,
    };
  }

  // SOC 2 Type II specific endpoints
  @Get('compliance/soc2/:entityType/:entityId')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Get SOC 2 Type II compliance records' })
  async getSOC2Compliance(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return await this.complianceService.getSOC2Compliance(entityType, entityId);
  }

  @Post('compliance/soc2/:entityType/:entityId/assess')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Assess SOC 2 Type II compliance' })
  async assessSOC2Compliance(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() assessmentData: any,
  ) {
    return await this.complianceService.assessSOC2Compliance(entityType, entityId, assessmentData);
  }

  // ISO 27001 specific endpoints
  @Get('compliance/iso27001/:entityType/:entityId')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Get ISO 27001 compliance records' })
  async getISO27001Compliance(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return await this.complianceService.getISO27001Compliance(entityType, entityId);
  }

  @Post('compliance/iso27001/:entityType/:entityId/assess')
  @Roles(UserRole.PLATFORM_ADMIN, UserRole.ENTERPRISE_ADMIN)
  @ApiOperation({ summary: 'Assess ISO 27001 compliance' })
  async assessISO27001Compliance(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() assessmentData: any,
  ) {
    return await this.complianceService.assessISO27001Compliance(entityType, entityId, assessmentData);
  }
}

