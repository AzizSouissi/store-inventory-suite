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
import { SuppliersService } from './suppliers.service';
import { SupplierCreateDto } from './dto/supplier-create.dto';
import { SupplierUpdateDto } from './dto/supplier-update.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../auth/roles.enum';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  create(@Body() request: SupplierCreateDto): Promise<SupplierResponseDto> {
    return this.suppliersService.create(request);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  update(
    @Param('id') id: string,
    @Body() request: SupplierUpdateDto,
  ): Promise<SupplierResponseDto> {
    return this.suppliersService.update(id, request);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    await this.suppliersService.delete(id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  getById(@Param('id') id: string): Promise<SupplierResponseDto> {
    return this.suppliersService.getById(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  getAll(): Promise<SupplierResponseDto[]> {
    return this.suppliersService.getAll();
  }
}
