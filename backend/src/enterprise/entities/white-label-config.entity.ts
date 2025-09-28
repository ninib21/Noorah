import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { EnterpriseClient } from './enterprise-client.entity';

@Entity('white_label_configs')
export class WhiteLabelConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => EnterpriseClient, (client) => client.whiteLabelConfig)
  @JoinColumn()
  enterpriseClient: EnterpriseClient;

  @Column({ unique: true })
  customDomain: string;

  @Column({ type: 'jsonb' })
  branding: {
    logo: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    customCSS: string;
    customJavaScript: string;
  };

  @Column({ type: 'jsonb' })
  content: {
    appName: string;
    tagline: string;
    description: string;
    termsOfService: string;
    privacyPolicy: string;
    supportEmail: string;
    supportPhone: string;
    helpCenterUrl: string;
    customPages: Record<string, string>;
  };

  @Column({ type: 'jsonb' })
  features: {
    enabledFeatures: string[];
    disabledFeatures: string[];
    customFeatures: Record<string, any>;
    integrations: Record<string, any>;
  };

  @Column({ type: 'jsonb' })
  emailTemplates: {
    welcome: string;
    bookingConfirmation: string;
    bookingReminder: string;
    paymentReceipt: string;
    passwordReset: string;
    customTemplates: Record<string, string>;
  };

  @Column({ type: 'jsonb' })
  notifications: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    customNotifications: Record<string, any>;
  };

  @Column({ type: 'jsonb' })
  analytics: {
    googleAnalyticsId: string;
    facebookPixelId: string;
    customTracking: Record<string, any>;
  };

  @Column({ type: 'jsonb' })
  api: {
    customEndpoints: Record<string, any>;
    rateLimits: Record<string, number>;
    webhooks: Record<string, any>;
  };

  @Column({ type: 'jsonb' })
  mobile: {
    appStoreUrl: string;
    playStoreUrl: string;
    customSplashScreen: string;
    customIcons: Record<string, string>;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  activatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deactivatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

