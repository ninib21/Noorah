import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceRecord, ComplianceType, ComplianceStatus, ComplianceSeverity } from './entities/compliance-record.entity';
import { AuditService } from './audit.service';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(ComplianceRecord)
    private complianceRecordRepository: Repository<ComplianceRecord>,
    private auditService: AuditService,
  ) {}

  async createComplianceRecord(recordData: Partial<ComplianceRecord>): Promise<ComplianceRecord> {
    const record = this.complianceRecordRepository.create(recordData);
    const savedRecord = await this.complianceRecordRepository.save(record);

    await this.auditService.logComplianceEvent({
      complianceType: recordData.complianceType || 'unknown',
      entityType: recordData.entityType || 'unknown',
      entityId: recordData.entityId || 'unknown',
      action: 'compliance_record_created',
      result: 'success' as any,
      details: `Compliance record created for ${recordData.complianceType}`,
    });

    return savedRecord;
  }

  async getComplianceRecord(id: string): Promise<ComplianceRecord> {
    const record = await this.complianceRecordRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('Compliance record not found');
    }
    return record;
  }

  async getComplianceRecords(
    entityType: string,
    entityId: string,
    complianceType?: ComplianceType
  ): Promise<ComplianceRecord[]> {
    const query = this.complianceRecordRepository.createQueryBuilder('record')
      .where('record.entityType = :entityType', { entityType })
      .andWhere('record.entityId = :entityId', { entityId });

    if (complianceType) {
      query.andWhere('record.complianceType = :complianceType', { complianceType });
    }

    return await query.orderBy('record.createdAt', 'DESC').getMany();
  }

  async updateComplianceRecord(
    id: string,
    updateData: Partial<ComplianceRecord>
  ): Promise<ComplianceRecord> {
    const record = await this.getComplianceRecord(id);
    Object.assign(record, updateData);
    
    const savedRecord = await this.complianceRecordRepository.save(record);

    await this.auditService.logComplianceEvent({
      complianceType: record.complianceType,
      entityType: record.entityType,
      entityId: record.entityId,
      action: 'compliance_record_updated',
      result: 'success' as any,
      details: `Compliance record updated for ${record.complianceType}`,
    });

    return savedRecord;
  }

  async assessCompliance(
    entityType: string,
    entityId: string,
    complianceType: ComplianceType,
    assessmentData: {
      assessor: string;
      findings: string[];
      recommendations: string[];
      score: number;
      maxScore: number;
    }
  ): Promise<ComplianceRecord> {
    const record = await this.complianceRecordRepository.findOne({
      where: {
        entityType,
        entityId,
        complianceType,
      },
    });

    if (!record) {
      throw new NotFoundException('Compliance record not found');
    }

    record.assessment = {
      assessor: assessmentData.assessor,
      assessmentDate: new Date(),
      findings: assessmentData.findings,
      recommendations: assessmentData.recommendations,
      score: assessmentData.score,
      maxScore: assessmentData.maxScore,
    };

    // Determine status based on score
    const compliancePercentage = (assessmentData.score / assessmentData.maxScore) * 100;
    if (compliancePercentage >= 90) {
      record.status = ComplianceStatus.COMPLIANT;
    } else if (compliancePercentage >= 70) {
      record.status = ComplianceStatus.PARTIALLY_COMPLIANT;
    } else {
      record.status = ComplianceStatus.NON_COMPLIANT;
    }

    const savedRecord = await this.complianceRecordRepository.save(record);

    await this.auditService.logComplianceEvent({
      complianceType,
      entityType,
      entityId,
      action: 'compliance_assessment_completed',
      result: 'success' as any,
      details: `Compliance assessment completed with score ${assessmentData.score}/${assessmentData.maxScore}`,
    });

    return savedRecord;
  }

  async createRemediationPlan(
    id: string,
    remediationData: {
      plan: string;
      assignedTo: string;
      dueDate: Date;
      notes: string;
    }
  ): Promise<ComplianceRecord> {
    const record = await this.getComplianceRecord(id);
    
    record.remediation = {
      plan: remediationData.plan,
      assignedTo: remediationData.assignedTo,
      dueDate: remediationData.dueDate,
      status: 'pending',
      notes: remediationData.notes,
    };

    const savedRecord = await this.complianceRecordRepository.save(record);

    await this.auditService.logComplianceEvent({
      complianceType: record.complianceType,
      entityType: record.entityType,
      entityId: record.entityId,
      action: 'remediation_plan_created',
      result: 'success' as any,
      details: `Remediation plan created for ${record.complianceType}`,
    });

    return savedRecord;
  }

  async getComplianceDashboard(): Promise<{
    totalRecords: number;
    compliantRecords: number;
    nonCompliantRecords: number;
    partiallyCompliantRecords: number;
    expiredRecords: number;
    complianceByType: Record<string, number>;
    complianceByEntity: Record<string, number>;
    upcomingAssessments: ComplianceRecord[];
    overdueRemediations: ComplianceRecord[];
  }> {
    const records = await this.complianceRecordRepository.find();

    const dashboard = {
      totalRecords: records.length,
      compliantRecords: records.filter(r => r.status === ComplianceStatus.COMPLIANT).length,
      nonCompliantRecords: records.filter(r => r.status === ComplianceStatus.NON_COMPLIANT).length,
      partiallyCompliantRecords: records.filter(r => r.status === ComplianceStatus.PARTIALLY_COMPLIANT).length,
      expiredRecords: records.filter(r => r.expiryDate && r.expiryDate < new Date()).length,
      complianceByType: {},
      complianceByEntity: {},
      upcomingAssessments: [],
      overdueRemediations: [],
    };

    // Count by compliance type
    records.forEach(record => {
      dashboard.complianceByType[record.complianceType] = 
        (dashboard.complianceByType[record.complianceType] || 0) + 1;
      dashboard.complianceByEntity[record.entityType] = 
        (dashboard.complianceByEntity[record.entityType] || 0) + 1;
    });

    // Get upcoming assessments (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    dashboard.upcomingAssessments = records.filter(record => 
      record.nextAssessmentDate && 
      record.nextAssessmentDate <= thirtyDaysFromNow &&
      record.nextAssessmentDate >= new Date()
    ) as any;

    // Get overdue remediations
    dashboard.overdueRemediations = records.filter(record => 
      record.remediation?.dueDate && 
      record.remediation.dueDate < new Date() &&
      record.remediation.status !== 'completed'
    ) as any;

    return dashboard;
  }

  async getComplianceReport(
    entityType?: string,
    entityId?: string,
    complianceType?: ComplianceType
  ): Promise<ComplianceRecord[]> {
    const query = this.complianceRecordRepository.createQueryBuilder('record');

    if (entityType) {
      query.andWhere('record.entityType = :entityType', { entityType });
    }

    if (entityId) {
      query.andWhere('record.entityId = :entityId', { entityId });
    }

    if (complianceType) {
      query.andWhere('record.complianceType = :complianceType', { complianceType });
    }

    return await query
      .orderBy('record.createdAt', 'DESC')
      .getMany();
  }

  async exportComplianceData(
    filters: {
      entityType?: string;
      entityId?: string;
      complianceType?: ComplianceType;
      status?: ComplianceStatus;
    },
    format: 'csv' | 'json' | 'pdf'
  ): Promise<Buffer> {
    const records = await this.getComplianceReport(
      filters.entityType,
      filters.entityId,
      filters.complianceType
    );

    const filteredRecords = filters.status 
      ? records.filter(record => record.status === filters.status)
      : records;

    switch (format) {
      case 'csv':
        return this.exportToCSV(filteredRecords);
      case 'json':
        return this.exportToJSON(filteredRecords);
      case 'pdf':
        return this.exportToPDF(filteredRecords);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private exportToCSV(records: ComplianceRecord[]): Buffer {
    const headers = [
      'ID', 'Compliance Type', 'Entity Type', 'Entity ID', 'Status', 'Severity',
      'Requirement', 'Description', 'Assessment Date', 'Expiry Date', 'Created At'
    ];

    const rows = records.map(record => [
      record.id,
      record.complianceType,
      record.entityType,
      record.entityId,
      record.status,
      record.severity,
      record.requirement || '',
      record.description || '',
      record.assessmentDate?.toISOString() || '',
      record.expiryDate?.toISOString() || '',
      record.createdAt.toISOString(),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return Buffer.from(csvContent, 'utf-8');
  }

  private exportToJSON(records: ComplianceRecord[]): Buffer {
    const jsonContent = JSON.stringify(records, null, 2);
    return Buffer.from(jsonContent, 'utf-8');
  }

  private exportToPDF(records: ComplianceRecord[]): Buffer {
    // This would typically use a PDF generation library
    const pdfContent = records.map(record => 
      `${record.createdAt.toISOString()} - ${record.complianceType} - ${record.status} - ${record.description || ''}`
    ).join('\n');
    
    return Buffer.from(pdfContent, 'utf-8');
  }

  // SOC 2 Type II specific methods
  async getSOC2Compliance(entityType: string, entityId: string): Promise<ComplianceRecord[]> {
    return await this.getComplianceRecords(entityType, entityId, ComplianceType.SOC2_TYPE_II);
  }

  async assessSOC2Compliance(
    entityType: string,
    entityId: string,
    assessmentData: {
      assessor: string;
      findings: string[];
      recommendations: string[];
      score: number;
      maxScore: number;
    }
  ): Promise<ComplianceRecord> {
    return await this.assessCompliance(entityType, entityId, ComplianceType.SOC2_TYPE_II, assessmentData);
  }

  // ISO 27001 specific methods
  async getISO27001Compliance(entityType: string, entityId: string): Promise<ComplianceRecord[]> {
    return await this.getComplianceRecords(entityType, entityId, ComplianceType.ISO_27001);
  }

  async assessISO27001Compliance(
    entityType: string,
    entityId: string,
    assessmentData: {
      assessor: string;
      findings: string[];
      recommendations: string[];
      score: number;
      maxScore: number;
    }
  ): Promise<ComplianceRecord> {
    return await this.assessCompliance(entityType, entityId, ComplianceType.ISO_27001, assessmentData);
  }
}

