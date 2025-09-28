import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType, UserStatus } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async getProfile(userId: string): Promise<User> {
    return this.findOne(userId);
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    return this.update(userId, updateData);
  }

  async searchSitters(searchDto: any): Promise<User[]> {
    // Placeholder implementation
    return this.userRepository.find({
      where: { userType: 'sitter' },
      take: 10,
    });
  }

  async getSitterProfile(id: string): Promise<any> {
    // Placeholder implementation
    return { id, type: 'sitter' };
  }

  async getParentProfile(id: string): Promise<any> {
    // Placeholder implementation
    return { id, type: 'parent' };
  }

  async getRecommendations(userId: string): Promise<any[]> {
    // Placeholder implementation
    return [];
  }

  async addToFavorites(userId: string, sitterId: string): Promise<void> {
    // Placeholder implementation
    console.log(`Adding sitter ${sitterId} to favorites for user ${userId}`);
  }

  async removeFromFavorites(userId: string, sitterId: string): Promise<void> {
    // Placeholder implementation
    console.log(`Removing sitter ${sitterId} from favorites for user ${userId}`);
  }

  async getFavorites(userId: string): Promise<any[]> {
    // Placeholder implementation
    return [];
  }

  async blockUser(userId: string, targetUserId: string): Promise<void> {
    // Placeholder implementation
    console.log(`User ${userId} blocking user ${targetUserId}`);
  }

  async unblockUser(userId: string, targetUserId: string): Promise<void> {
    // Placeholder implementation
    console.log(`User ${userId} unblocking user ${targetUserId}`);
  }

  async getBlockedUsers(userId: string): Promise<any[]> {
    // Placeholder implementation
    return [];
  }

  async getAllUsers(query: any): Promise<User[]> {
    return this.findAll();
  }

  async getUserById(id: string): Promise<User> {
    return this.findOne(id);
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    return this.update(id, updateData);
  }

  async deleteUser(id: string): Promise<void> {
    return this.delete(id);
  }

  async verifyUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.emailVerified = true;
    return this.userRepository.save(user);
  }

  async suspendUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.SUSPENDED;
    return this.userRepository.save(user);
  }

  async activateUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.ACTIVE;
    return this.userRepository.save(user);
  }
} 
