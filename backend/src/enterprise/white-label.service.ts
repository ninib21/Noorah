import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhiteLabelConfig } from './entities/white-label-config.entity';
import { EnterpriseClient } from './entities/enterprise-client.entity';
import { AuditService } from './audit.service';

@Injectable()
export class WhiteLabelService {
  constructor(
    @InjectRepository(WhiteLabelConfig)
    private whiteLabelConfigRepository: Repository<WhiteLabelConfig>,
    @InjectRepository(EnterpriseClient)
    private enterpriseClientRepository: Repository<EnterpriseClient>,
    private auditService: AuditService,
  ) {}

  async createWhiteLabelConfig(configData: Partial<WhiteLabelConfig>): Promise<WhiteLabelConfig> {
    // Validate enterprise client exists
    if (configData.enterpriseClient?.id) {
      const client = await this.enterpriseClientRepository.findOne({
        where: { id: configData.enterpriseClient.id },
      });
      if (!client) {
        throw new BadRequestException('Enterprise client not found');
      }
    }

    // Check if custom domain is available
    if (configData.customDomain) {
      const existingConfig = await this.whiteLabelConfigRepository.findOne({
        where: { customDomain: configData.customDomain },
      });
      if (existingConfig) {
        throw new BadRequestException('Custom domain already in use');
      }
    }

    const config = this.whiteLabelConfigRepository.create(configData);
    const savedConfig = await this.whiteLabelConfigRepository.save(config);

    await this.auditService.logEvent({
      eventType: 'WHITE_LABEL_CONFIG_CREATED' as any,
      userId: configData.enterpriseClient?.adminUser?.id,
      resource: 'white_label_config',
      resourceId: savedConfig.id,
      result: 'success' as any,
      description: `White label configuration created for ${configData.customDomain}`,
      metadata: { configData: savedConfig },
    });

    return savedConfig;
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

  async getWhiteLabelConfigByDomain(domain: string): Promise<WhiteLabelConfig> {
    const config = await this.whiteLabelConfigRepository.findOne({
      where: { customDomain: domain },
      relations: ['enterpriseClient'],
    });

    if (!config) {
      throw new NotFoundException('White label configuration not found');
    }

    return config;
  }

  async updateWhiteLabelConfig(
    enterpriseClientId: string,
    updateData: Partial<WhiteLabelConfig>
  ): Promise<WhiteLabelConfig> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    
    const oldValues = { ...config };
    Object.assign(config, updateData);
    
    const savedConfig = await this.whiteLabelConfigRepository.save(config);

    await this.auditService.logEvent({
      eventType: 'WHITE_LABEL_CONFIG_UPDATED' as any,
      userId: config.enterpriseClient?.adminUser?.id,
      resource: 'white_label_config',
      resourceId: savedConfig.id,
      result: 'success' as any,
      description: `White label configuration updated for ${config.customDomain}`,
      metadata: { oldValues, newValues: savedConfig },
    });

    return savedConfig;
  }

  async updateBranding(
    enterpriseClientId: string,
    branding: {
      logo?: {
        url: string;
        alt: string;
        width: number;
        height: number;
      };
      favicon?: string;
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      backgroundColor?: string;
      textColor?: string;
      fontFamily?: string;
      customCSS?: string;
      customJavaScript?: string;
    }
  ): Promise<WhiteLabelConfig> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    
    config.branding = {
      ...config.branding,
      ...branding,
    };

    const savedConfig = await this.whiteLabelConfigRepository.save(config);

    await this.auditService.logEvent({
      eventType: 'WHITE_LABEL_BRANDING_UPDATED' as any,
      userId: config.enterpriseClient?.adminUser?.id,
      resource: 'white_label_config',
      resourceId: savedConfig.id,
      result: 'success' as any,
      description: `White label branding updated for ${config.customDomain}`,
      metadata: { branding },
    });

    return savedConfig;
  }

  async updateContent(
    enterpriseClientId: string,
    content: {
      appName?: string;
      tagline?: string;
      description?: string;
      termsOfService?: string;
      privacyPolicy?: string;
      supportEmail?: string;
      supportPhone?: string;
      helpCenterUrl?: string;
      customPages?: Record<string, string>;
    }
  ): Promise<WhiteLabelConfig> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    
    config.content = {
      ...config.content,
      ...content,
    };

    const savedConfig = await this.whiteLabelConfigRepository.save(config);

    await this.auditService.logEvent({
      eventType: 'WHITE_LABEL_CONTENT_UPDATED' as any,
      userId: config.enterpriseClient?.adminUser?.id,
      resource: 'white_label_config',
      resourceId: savedConfig.id,
      result: 'success' as any,
      description: `White label content updated for ${config.customDomain}`,
      metadata: { content },
    });

    return savedConfig;
  }

  async updateFeatures(
    enterpriseClientId: string,
    features: {
      enabledFeatures?: string[];
      disabledFeatures?: string[];
      customFeatures?: Record<string, any>;
      integrations?: Record<string, any>;
    }
  ): Promise<WhiteLabelConfig> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    
    config.features = {
      ...config.features,
      ...features,
    };

    const savedConfig = await this.whiteLabelConfigRepository.save(config);

    await this.auditService.logEvent({
      eventType: 'WHITE_LABEL_FEATURES_UPDATED' as any,
      userId: config.enterpriseClient?.adminUser?.id,
      resource: 'white_label_config',
      resourceId: savedConfig.id,
      result: 'success' as any,
      description: `White label features updated for ${config.customDomain}`,
      metadata: { features },
    });

    return savedConfig;
  }

  async updateEmailTemplates(
    enterpriseClientId: string,
    emailTemplates: {
      welcome?: string;
      bookingConfirmation?: string;
      bookingReminder?: string;
      paymentReceipt?: string;
      passwordReset?: string;
      customTemplates?: Record<string, string>;
    }
  ): Promise<WhiteLabelConfig> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    
    config.emailTemplates = {
      ...config.emailTemplates,
      ...emailTemplates,
    };

    const savedConfig = await this.whiteLabelConfigRepository.save(config);

    await this.auditService.logEvent({
      eventType: 'WHITE_LABEL_EMAIL_TEMPLATES_UPDATED' as any,
      userId: config.enterpriseClient?.adminUser?.id,
      resource: 'white_label_config',
      resourceId: savedConfig.id,
      result: 'success' as any,
      description: `White label email templates updated for ${config.customDomain}`,
      metadata: { emailTemplates },
    });

    return savedConfig;
  }

  async updateNotifications(
    enterpriseClientId: string,
    notifications: {
      pushNotifications?: boolean;
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      customNotifications?: Record<string, any>;
    }
  ): Promise<WhiteLabelConfig> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    
    config.notifications = {
      ...config.notifications,
      ...notifications,
    };

    const savedConfig = await this.whiteLabelConfigRepository.save(config);

    await this.auditService.logEvent({
      eventType: 'WHITE_LABEL_NOTIFICATIONS_UPDATED' as any,
      userId: config.enterpriseClient?.adminUser?.id,
      resource: 'white_label_config',
      resourceId: savedConfig.id,
      result: 'success' as any,
      description: `White label notifications updated for ${config.customDomain}`,
      metadata: { notifications },
    });

    return savedConfig;
  }

  async updateAnalytics(
    enterpriseClientId: string,
    analytics: {
      googleAnalyticsId?: string;
      facebookPixelId?: string;
      customTracking?: Record<string, any>;
    }
  ): Promise<WhiteLabelConfig> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    
    config.analytics = {
      ...config.analytics,
      ...analytics,
    };

    const savedConfig = await this.whiteLabelConfigRepository.save(config);

    await this.auditService.logEvent({
      eventType: 'WHITE_LABEL_ANALYTICS_UPDATED' as any,
      userId: config.enterpriseClient?.adminUser?.id,
      resource: 'white_label_config',
      resourceId: savedConfig.id,
      result: 'success' as any,
      description: `White label analytics updated for ${config.customDomain}`,
      metadata: { analytics },
    });

    return savedConfig;
  }

  async updateMobileConfig(
    enterpriseClientId: string,
    mobile: {
      appStoreUrl?: string;
      playStoreUrl?: string;
      customSplashScreen?: string;
      customIcons?: Record<string, string>;
    }
  ): Promise<WhiteLabelConfig> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    
    config.mobile = {
      ...config.mobile,
      ...mobile,
    };

    const savedConfig = await this.whiteLabelConfigRepository.save(config);

    await this.auditService.logEvent({
      eventType: 'WHITE_LABEL_MOBILE_UPDATED' as any,
      userId: config.enterpriseClient?.adminUser?.id,
      resource: 'white_label_config',
      resourceId: savedConfig.id,
      result: 'success' as any,
      description: `White label mobile configuration updated for ${config.customDomain}`,
      metadata: { mobile },
    });

    return savedConfig;
  }

  async activateWhiteLabel(enterpriseClientId: string): Promise<WhiteLabelConfig> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    
    config.isActive = true;
    config.activatedAt = new Date();
    
    const savedConfig = await this.whiteLabelConfigRepository.save(config);

    await this.auditService.logEvent({
      eventType: 'WHITE_LABEL_ACTIVATED' as any,
      userId: config.enterpriseClient?.adminUser?.id,
      resource: 'white_label_config',
      resourceId: savedConfig.id,
      result: 'success' as any,
      description: `White label configuration activated for ${config.customDomain}`,
    });

    return savedConfig;
  }

  async deactivateWhiteLabel(enterpriseClientId: string): Promise<WhiteLabelConfig> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    
    config.isActive = false;
    config.deactivatedAt = new Date();
    
    const savedConfig = await this.whiteLabelConfigRepository.save(config);

    await this.auditService.logEvent({
      eventType: 'WHITE_LABEL_DEACTIVATED' as any,
      userId: config.enterpriseClient?.adminUser?.id,
      resource: 'white_label_config',
      resourceId: savedConfig.id,
      result: 'success' as any,
      description: `White label configuration deactivated for ${config.customDomain}`,
    });

    return savedConfig;
  }

  async generateThemeAssets(enterpriseClientId: string): Promise<{
    css: string;
    javascript: string;
    manifest: any;
  }> {
    const config = await this.getWhiteLabelConfig(enterpriseClientId);
    
    // Generate CSS from branding configuration
    const css = this.generateCSS(config.branding);
    
    // Generate JavaScript from configuration
    const javascript = this.generateJavaScript(config);
    
    // Generate web app manifest
    const manifest = this.generateManifest(config);

    return { css, javascript, manifest };
  }

  private generateCSS(branding: any): string {
    return `
      :root {
        --primary-color: ${branding.primaryColor || '#3A7DFF'};
        --secondary-color: ${branding.secondaryColor || '#FF7DB9'};
        --accent-color: ${branding.accentColor || '#10B981'};
        --background-color: ${branding.backgroundColor || '#FFFFFF'};
        --text-color: ${branding.textColor || '#1F2937'};
        --font-family: ${branding.fontFamily || 'Inter, sans-serif'};
      }
      
      body {
        font-family: var(--font-family);
        background-color: var(--background-color);
        color: var(--text-color);
      }
      
      .btn-primary {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
      }
      
      .btn-secondary {
        background-color: var(--secondary-color);
        border-color: var(--secondary-color);
      }
      
      ${branding.customCSS || ''}
    `;
  }

  private generateJavaScript(config: any): string {
    return `
      // White label configuration
      window.whiteLabelConfig = ${JSON.stringify(config, null, 2)};
      
      // Analytics tracking
      ${config.analytics?.googleAnalyticsId ? `
        gtag('config', '${config.analytics.googleAnalyticsId}');
      ` : ''}
      
      ${config.analytics?.facebookPixelId ? `
        fbq('init', '${config.analytics.facebookPixelId}');
        fbq('track', 'PageView');
      ` : ''}
      
      ${config.branding?.customJavaScript || ''}
    `;
  }

  private generateManifest(config: any): any {
    return {
      name: config.content.appName || 'Noorah',
      short_name: config.content.appName || 'Noorah',
      description: config.content.description || 'Trusted babysitting platform',
      start_url: '/',
      display: 'standalone',
      background_color: config.branding.backgroundColor || '#FFFFFF',
      theme_color: config.branding.primaryColor || '#3A7DFF',
      icons: config.mobile?.customIcons ? Object.values(config.mobile.customIcons) : [],
    };
  }
}

