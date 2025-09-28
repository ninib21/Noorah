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
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SearchUsersDto } from './dto/search-users.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('sitters')
  @ApiOperation({ summary: 'Search for sitters' })
  @ApiResponse({ status: 200, description: 'Sitters retrieved successfully' })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'minRating', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'availability', required: false })
  async searchSitters(@Query() searchDto: SearchUsersDto) {
    return this.usersService.searchSitters(searchDto);
  }

  @Get('sitters/:id')
  @ApiOperation({ summary: 'Get sitter profile by ID' })
  @ApiResponse({ status: 200, description: 'Sitter profile retrieved' })
  @ApiResponse({ status: 404, description: 'Sitter not found' })
  async getSitterProfile(@Param('id') id: string) {
    return this.usersService.getSitterProfile(id);
  }

  @Get('parents/:id')
  @ApiOperation({ summary: 'Get parent profile by ID' })
  @ApiResponse({ status: 200, description: 'Parent profile retrieved' })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  async getParentProfile(@Param('id') id: string) {
    return this.usersService.getParentProfile(id);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get personalized sitter recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved' })
  async getRecommendations(@Request() req) {
    return this.usersService.getRecommendations(req.user.id);
  }

  @Post('favorites/:sitterId')
  @ApiOperation({ summary: 'Add sitter to favorites' })
  @ApiResponse({ status: 201, description: 'Sitter added to favorites' })
  async addToFavorites(@Request() req, @Param('sitterId') sitterId: string) {
    return this.usersService.addToFavorites(req.user.id, sitterId);
  }

  @Delete('favorites/:sitterId')
  @ApiOperation({ summary: 'Remove sitter from favorites' })
  @ApiResponse({ status: 200, description: 'Sitter removed from favorites' })
  async removeFromFavorites(@Request() req, @Param('sitterId') sitterId: string) {
    return this.usersService.removeFromFavorites(req.user.id, sitterId);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({ status: 200, description: 'Favorites retrieved' })
  async getFavorites(@Request() req) {
    return this.usersService.getFavorites(req.user.id);
  }

  @Post('block/:userId')
  @ApiOperation({ summary: 'Block a user' })
  @ApiResponse({ status: 201, description: 'User blocked successfully' })
  async blockUser(@Request() req, @Param('userId') userId: string) {
    return this.usersService.blockUser(req.user.id, userId);
  }

  @Delete('block/:userId')
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiResponse({ status: 200, description: 'User unblocked successfully' })
  async unblockUser(@Request() req, @Param('userId') userId: string) {
    return this.usersService.unblockUser(req.user.id, userId);
  }

  @Get('blocked')
  @ApiOperation({ summary: 'Get blocked users' })
  @ApiResponse({ status: 200, description: 'Blocked users retrieved' })
  async getBlockedUsers(@Request() req) {
    return this.usersService.getBlockedUsers(req.user.id);
  }

  // Admin only endpoints
  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userType', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getAllUsers(@Query() query: any) {
    return this.usersService.getAllUsers(query);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Post(':id/verify')
  @Roles('admin')
  @ApiOperation({ summary: 'Verify user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User verified successfully' })
  async verifyUser(@Param('id') id: string) {
    return this.usersService.verifyUser(id);
  }

  @Post(':id/suspend')
  @Roles('admin')
  @ApiOperation({ summary: 'Suspend user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  async suspendUser(@Param('id') id: string) {
    return this.usersService.suspendUser(id);
  }

  @Post(':id/activate')
  @Roles('admin')
  @ApiOperation({ summary: 'Activate user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  async activateUser(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }
} 
