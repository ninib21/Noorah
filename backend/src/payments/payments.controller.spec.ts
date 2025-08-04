import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockPaymentsService = {
    createPaymentIntent: jest.fn(),
    processPayment: jest.fn(),
    getAllPayments: jest.fn(),
    addPaymentMethod: jest.fn(),
    removePaymentMethod: jest.fn(),
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
      const createPaymentIntentDto = {
        amount: 1000,
        currency: 'usd',
      };

      const mockRequest = {
        user: { id: 'test-user-id' },
      };

      const result = await controller.createPaymentIntent(mockRequest, createPaymentIntentDto);

      expect(result).toBeDefined();
      expect(mockPaymentsService.createPaymentIntent).toHaveBeenCalledWith(
        createPaymentIntentDto.amount,
        createPaymentIntentDto.currency
      );
    });

    it('should handle payment intent creation failure', async () => {
      const createPaymentIntentDto = {
        amount: 1000,
        currency: 'usd',
      };

      const mockRequest = {
        user: { id: 'test-user-id' },
      };

      mockPaymentsService.createPaymentIntent.mockRejectedValue(new Error('Payment failed'));

      await expect(controller.createPaymentIntent(mockRequest, createPaymentIntentDto)).rejects.toThrow('Payment failed');
    });
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const processPaymentDto = {
        paymentIntentId: 'pi_test_123',
        amount: 1000,
      };

      const mockRequest = {
        user: { id: 'test-user-id' },
      };

      const result = await controller.processPayment(mockRequest, processPaymentDto);

      expect(result).toBeDefined();
      expect(mockPaymentsService.processPayment).toHaveBeenCalledWith(
        mockRequest.user.id,
        processPaymentDto.paymentIntentId
      );
    });
  });

  describe('getAllPayments', () => {
    it('should return all payments', async () => {
      const filters = { status: 'completed' };

      const result = await controller.getAllPayments(filters);

      expect(result).toBeDefined();
      expect(mockPaymentsService.getAllPayments).toHaveBeenCalledWith(filters);
    });
  });

  describe('addPaymentMethod', () => {
    it('should add payment method successfully', async () => {
      const addMethodDto = {
        paymentMethodId: 'pm_test_123',
        setAsDefault: true,
      };

      const mockRequest = {
        user: { id: 'test-user-id' },
      };

      const result = await controller.addPaymentMethod(mockRequest, addMethodDto);

      expect(result).toBeDefined();
      expect(mockPaymentsService.addPaymentMethod).toHaveBeenCalledWith(
        mockRequest.user.id,
        addMethodDto
      );
    });
  });

  describe('removePaymentMethod', () => {
    it('should remove payment method successfully', async () => {
      const methodId = 'pm_test_123';
      const mockRequest = {
        user: { id: 'test-user-id' },
      };

      const result = await controller.removePaymentMethod(mockRequest, methodId);

      expect(result).toBeDefined();
      expect(mockPaymentsService.removePaymentMethod).toHaveBeenCalledWith(
        mockRequest.user.id,
        methodId
      );
    });
  });
}); 