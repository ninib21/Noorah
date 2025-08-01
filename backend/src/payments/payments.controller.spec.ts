import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentIntentDto, ProcessPaymentDto, RefundPaymentDto } from './dto/payment.dto';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockPaymentsService = {
    createPaymentIntent: jest.fn(),
    processPayment: jest.fn(),
    confirmPayment: jest.fn(),
    refundPayment: jest.fn(),
    getPayments: jest.fn(),
    getPayment: jest.fn(),
    getBookingPayments: jest.fn(),
    handleStripeWebhook: jest.fn(),
    createSitterConnectAccount: jest.fn(),
    getSitterConnectStatus: jest.fn(),
    completeSitterOnboarding: jest.fn(),
    requestSitterPayout: jest.fn(),
    getSitterEarnings: jest.fn(),
    getSitterPayouts: jest.fn(),
    addParentPaymentMethod: jest.fn(),
    getParentPaymentMethods: jest.fn(),
    removeParentPaymentMethod: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      userType: 'parent',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent successfully', async () => {
      const createPaymentIntentDto: CreatePaymentIntentDto = {
        bookingId: 'test-booking-id',
        paymentMethodId: 'pm_test_123',
      };

      const expectedResult = {
        id: 'pi_test_123',
        client_secret: 'pi_test_secret_123',
        status: 'requires_payment_method',
      };

      mockPaymentsService.createPaymentIntent.mockResolvedValue(expectedResult);

      const result = await controller.createPaymentIntent(mockRequest, createPaymentIntentDto);

      expect(service.createPaymentIntent).toHaveBeenCalledWith(
        mockRequest.user.id,
        createPaymentIntentDto.bookingId,
        createPaymentIntentDto.paymentMethodId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const createPaymentIntentDto: CreatePaymentIntentDto = {
        bookingId: 'test-booking-id',
        paymentMethodId: 'pm_test_123',
      };

      const error = new Error('Payment intent creation failed');
      mockPaymentsService.createPaymentIntent.mockRejectedValue(error);

      await expect(
        controller.createPaymentIntent(mockRequest, createPaymentIntentDto),
      ).rejects.toThrow('Payment intent creation failed');
    });
  });

  describe('processPayment', () => {
    it('should process a payment successfully', async () => {
      const processPaymentDto: ProcessPaymentDto = {
        paymentIntentId: 'pi_test_123',
      };

      const expectedResult = {
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 10000,
      };

      mockPaymentsService.processPayment.mockResolvedValue(expectedResult);

      const result = await controller.processPayment(mockRequest, processPaymentDto);

      expect(service.processPayment).toHaveBeenCalledWith(
        mockRequest.user.id,
        processPaymentDto.paymentIntentId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a payment successfully', async () => {
      const paymentId = 'test-payment-id';
      const expectedResult = {
        id: paymentId,
        status: 'confirmed',
      };

      mockPaymentsService.confirmPayment.mockResolvedValue(expectedResult);

      const result = await controller.confirmPayment(paymentId, mockRequest);

      expect(service.confirmPayment).toHaveBeenCalledWith(paymentId, mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('refundPayment', () => {
    it('should refund a payment successfully', async () => {
      const paymentId = 'test-payment-id';
      const refundPaymentDto: RefundPaymentDto = {
        reason: 'Customer requested refund',
      };

      const expectedResult = {
        id: 're_test_123',
        status: 'succeeded',
        amount: 10000,
      };

      mockPaymentsService.refundPayment.mockResolvedValue(expectedResult);

      const result = await controller.refundPayment(paymentId, refundPaymentDto, mockRequest);

      expect(service.refundPayment).toHaveBeenCalledWith(
        paymentId,
        mockRequest.user.id,
        refundPaymentDto.reason,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPayments', () => {
    it('should get payments with filters', async () => {
      const filters = {
        status: 'completed',
        page: 1,
        limit: 10,
      };

      const expectedResult = [
        {
          id: 'payment-1',
          amount: 10000,
          status: 'completed',
        },
        {
          id: 'payment-2',
          amount: 15000,
          status: 'completed',
        },
      ];

      mockPaymentsService.getPayments.mockResolvedValue(expectedResult);

      const result = await controller.getPayments(mockRequest, filters);

      expect(service.getPayments).toHaveBeenCalledWith(mockRequest.user.id, filters);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPayment', () => {
    it('should get a specific payment by ID', async () => {
      const paymentId = 'test-payment-id';
      const expectedResult = {
        id: paymentId,
        amount: 10000,
        status: 'completed',
      };

      mockPaymentsService.getPayment.mockResolvedValue(expectedResult);

      const result = await controller.getPayment(paymentId, mockRequest);

      expect(service.getPayment).toHaveBeenCalledWith(paymentId, mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getBookingPayments', () => {
    it('should get payments for a specific booking', async () => {
      const bookingId = 'test-booking-id';
      const expectedResult = [
        {
          id: 'payment-1',
          bookingId,
          amount: 10000,
        },
      ];

      mockPaymentsService.getBookingPayments.mockResolvedValue(expectedResult);

      const result = await controller.getBookingPayments(bookingId, mockRequest);

      expect(service.getBookingPayments).toHaveBeenCalledWith(bookingId, mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('stripeWebhook', () => {
    it('should handle Stripe webhook successfully', async () => {
      const payload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
          },
        },
      };

      const headers = {
        'stripe-signature': 'test-signature',
      };

      const expectedResult = { received: true };

      mockPaymentsService.handleStripeWebhook.mockResolvedValue(expectedResult);

      const result = await controller.stripeWebhook(payload, { headers });

      expect(service.handleStripeWebhook).toHaveBeenCalledWith(payload, headers);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('sitterConnectAccount', () => {
    it('should create Stripe Connect account for sitter', async () => {
      const expectedResult = {
        accountId: 'acct_test_123',
        onboardingUrl: 'https://connect.stripe.com/setup/s/test',
      };

      mockPaymentsService.createSitterConnectAccount.mockResolvedValue(expectedResult);

      const result = await controller.createSitterConnectAccount(mockRequest);

      expect(service.createSitterConnectAccount).toHaveBeenCalledWith(mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });

    it('should get sitter connect status', async () => {
      const expectedResult = {
        accountId: 'acct_test_123',
        status: 'active',
      };

      mockPaymentsService.getSitterConnectStatus.mockResolvedValue(expectedResult);

      const result = await controller.getSitterConnectStatus(mockRequest);

      expect(service.getSitterConnectStatus).toHaveBeenCalledWith(mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('sitterPayout', () => {
    it('should request sitter payout successfully', async () => {
      const payoutDto = {
        amount: 5000, // $50.00
      };

      const expectedResult = {
        id: 'po_test_123',
        amount: 5000,
        status: 'pending',
      };

      mockPaymentsService.requestSitterPayout.mockResolvedValue(expectedResult);

      const result = await controller.requestSitterPayout(mockRequest, payoutDto);

      expect(service.requestSitterPayout).toHaveBeenCalledWith(
        mockRequest.user.id,
        payoutDto.amount,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('sitterEarnings', () => {
    it('should get sitter earnings summary', async () => {
      const period = 'month';
      const expectedResult = {
        totalEarnings: 25000,
        pendingPayouts: 5000,
        completedPayouts: 20000,
        period: 'month',
      };

      mockPaymentsService.getSitterEarnings.mockResolvedValue(expectedResult);

      const result = await controller.getSitterEarnings(mockRequest, period);

      expect(service.getSitterEarnings).toHaveBeenCalledWith(mockRequest.user.id, period);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('parentPaymentMethods', () => {
    it('should add parent payment method', async () => {
      const paymentMethodData = {
        token: 'tok_test_123',
        type: 'card',
      };

      const expectedResult = {
        id: 'pm_test_123',
        type: 'card',
        last4: '4242',
      };

      mockPaymentsService.addParentPaymentMethod.mockResolvedValue(expectedResult);

      const result = await controller.addParentPaymentMethod(mockRequest, paymentMethodData);

      expect(service.addParentPaymentMethod).toHaveBeenCalledWith(
        mockRequest.user.id,
        paymentMethodData,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should get parent payment methods', async () => {
      const expectedResult = [
        {
          id: 'pm_test_123',
          type: 'card',
          last4: '4242',
        },
      ];

      mockPaymentsService.getParentPaymentMethods.mockResolvedValue(expectedResult);

      const result = await controller.getParentPaymentMethods(mockRequest);

      expect(service.getParentPaymentMethods).toHaveBeenCalledWith(mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });

    it('should remove parent payment method', async () => {
      const methodId = 'pm_test_123';

      mockPaymentsService.removeParentPaymentMethod.mockResolvedValue(undefined);

      const result = await controller.removeParentPaymentMethod(methodId, mockRequest);

      expect(service.removeParentPaymentMethod).toHaveBeenCalledWith(
        mockRequest.user.id,
        methodId,
      );
      expect(result).toBeUndefined();
    });
  });
}); 