import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryCreateDto } from './dto/category-create.dto';
import { CategoryUpdateDto } from './dto/category-update.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../auth/roles.enum';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  create(@Body() request: CategoryCreateDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(request);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  update(
    @Param('id') id: string,
    @Body() request: CategoryUpdateDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, request);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    await this.categoriesService.delete(id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  getById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.getById(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  getAll(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getAll();
  }
}
