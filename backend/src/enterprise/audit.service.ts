import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditEventType, AuditEventResult } from './entities/audit-log.entity';

export interface AuditEvent {
  eventType: AuditEventType;
  userId?: string;
  sessionId?: string;
  resource?: string;
  resourceId?: string;
  result?: AuditEventResult;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  context?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async logEvent(event: AuditEvent): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...event,
      result: event.result || AuditEventResult.SUCCESS,
    });

    return await this.auditLogRepository.save(auditLog);
  }

  async getAuditLogs(filters: {
    userId?: string;
    eventType?: AuditEventType;
    resource?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const query = this.auditLogRepository.createQueryBuilder('auditLog');

    if (filters.userId) {
      query.andWhere('auditLog.userId = :userId', { userId: filters.userId });
    }

    if (filters.eventType) {
      query.andWhere('auditLog.eventType = :eventType', { eventType: filters.eventType });
    }

    if (filters.resource) {
      query.andWhere('auditLog.resource = :resource', { resource: filters.resource });
    }

    if (filters.resourceId) {
      query.andWhere('auditLog.resourceId = :resourceId', { resourceId: filters.resourceId });
    }

    if (filters.startDate) {
      query.andWhere('auditLog.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('auditLog.createdAt <= :endDate', { endDate: filters.endDate });
    }

    const total = await query.getCount();

    if (filters.limit) {
      query.limit(filters.limit);
    }

    if (filters.offset) {
      query.offset(filters.offset);
    }

    query.orderBy('auditLog.createdAt', 'DESC');

    const logs = await query.getMany();

    return { logs, total };
  }

  async getAuditLog(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepository.findOne({ where: { id } });
    if (!log) {
      throw new Error('Audit log not found');
    }
    return log;
  }

  async getAuditSummary(period: string = 'month'): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByResult: Record<string, number>;
    topUsers: Array<{ userId: string; eventCount: number }>;
    securityEvents: number;
    complianceEvents: number;
  }> {
    const startDate = this.getPeriodStartDate(period);
    
    const query = this.auditLogRepository.createQueryBuilder('auditLog')
      .where('auditLog.createdAt >= :startDate', { startDate });

    const logs = await query.getMany();

    const summary = {
      totalEvents: logs.length,
      eventsByType: {},
      eventsByResult: {},
      topUsers: [],
      securityEvents: 0,
      complianceEvents: 0,
    };

    // Count events by type
    logs.forEach(log => {
      summary.eventsByType[log.eventType] = (summary.eventsByType[log.eventType] || 0) + 1;
      summary.eventsByResult[log.result] = (summary.eventsByResult[log.result] || 0) + 1;

      // Count security and compliance events
      if (log.eventType.includes('SECURITY') || log.eventType.includes('COMPLIANCE')) {
        summary.securityEvents++;
      }
      if (log.eventType.includes('COMPLIANCE')) {
        summary.complianceEvents++;
      }
    });

    // Get top users
    const userCounts = {};
    logs.forEach(log => {
      if (log.userId) {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
      }
    });

    summary.topUsers = (Object.entries(userCounts) as any)
      .map(([userId, eventCount]) => ({ userId, eventCount: eventCount as number }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    return summary;
  }

  async exportAuditLogs(filters: {
    startDate?: Date;
    endDate?: Date;
    format: 'csv' | 'json' | 'pdf';
  }): Promise<Buffer> {
    const { logs } = await this.getAuditLogs({
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: 10000, // Large limit for export
    });

    switch (filters.format) {
      case 'csv':
        return this.exportToCSV(logs);
      case 'json':
        return this.exportToJSON(logs);
      case 'pdf':
        return this.exportToPDF(logs);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return weekStart;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  private exportToCSV(logs: AuditLog[]): Buffer {
    const headers = [
      'ID', 'Event Type', 'User ID', 'Resource', 'Resource ID', 'Result',
      'Description', 'IP Address', 'User Agent', 'Created At'
    ];

    const rows = logs.map(log => [
      log.id,
      log.eventType,
      log.userId || '',
      log.resource || '',
      log.resourceId || '',
      log.result,
      log.description || '',
      log.ipAddress || '',
      log.userAgent || '',
      log.createdAt.toISOString(),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return Buffer.from(csvContent, 'utf-8');
  }

  private exportToJSON(logs: AuditLog[]): Buffer {
    const jsonContent = JSON.stringify(logs, null, 2);
    return Buffer.from(jsonContent, 'utf-8');
  }

  private exportToPDF(logs: AuditLog[]): Buffer {
    // This would typically use a PDF generation library like puppeteer or jsPDF
    // For now, return a simple text representation
    const pdfContent = logs.map(log => 
      `${log.createdAt.toISOString()} - ${log.eventType} - ${log.result} - ${log.description || ''}`
    ).join('\n');
    
    return Buffer.from(pdfContent, 'utf-8');
  }

  // Compliance-specific audit methods
  async logComplianceEvent(event: {
    complianceType: string;
    entityType: string;
    entityId: string;
    action: string;
    result: AuditEventResult;
    details?: string;
    userId?: string;
  }): Promise<AuditLog> {
    return await this.logEvent({
      eventType: AuditEventType.COMPLIANCE_VIOLATION,
      userId: event.userId,
      resource: event.entityType,
      resourceId: event.entityId,
      result: event.result,
      description: `${event.complianceType} compliance event: ${event.action}`,
      metadata: {
        complianceType: event.complianceType,
        action: event.action,
        details: event.details,
      },
    });
  }

  async logSecurityEvent(event: {
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    userId?: string;
    ipAddress?: string;
    metadata?: Record<string, any>;
  }): Promise<AuditLog> {
    return await this.logEvent({
      eventType: AuditEventType.SECURITY_ALERT,
      userId: event.userId,
      result: AuditEventResult.WARNING,
      description: `Security alert: ${event.description}`,
      ipAddress: event.ipAddress,
      metadata: {
        severity: event.severity,
        ...event.metadata,
      },
    });
  }
}

