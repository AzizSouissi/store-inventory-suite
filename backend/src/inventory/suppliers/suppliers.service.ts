import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier } from '../schemas/supplier.schema';
import { SupplierCreateDto } from './dto/supplier-create.dto';
import { SupplierUpdateDto } from './dto/supplier-update.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
  ) {}

  async create(request: SupplierCreateDto): Promise<SupplierResponseDto> {
    const exists = await this.supplierModel.exists({
      name: new RegExp(`^${request.name}$`, 'i'),
    });
    if (exists) {
      throw new BadRequestException('Supplier name already exists');
    }

    const saved = await this.supplierModel.create({
      name: request.name.trim(),
      phone: request.phone ?? null,
      address: request.address ?? null,
      notes: request.notes ?? null,
    });

    return this.toResponse(saved);
  }

  async update(
    id: string,
    request: SupplierUpdateDto,
  ): Promise<SupplierResponseDto> {
    const supplier = await this.supplierModel.findById(id).exec();
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const newName = request.name.trim();
    if (supplier.name.toLowerCase() !== newName.toLowerCase()) {
      const exists = await this.supplierModel.exists({
        name: new RegExp(`^${newName}$`, 'i'),
      });
      if (exists) {
        throw new BadRequestException('Supplier name already exists');
      }
    }

    supplier.name = newName;
    supplier.phone = request.phone ?? null;
    supplier.address = request.address ?? null;
    supplier.notes = request.notes ?? null;

    const saved = await supplier.save();
    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const exists = await this.supplierModel.exists({ _id: id });
    if (!exists) {
      throw new NotFoundException('Supplier not found');
    }
    await this.supplierModel.deleteOne({ _id: id }).exec();
  }

  async getById(id: string): Promise<SupplierResponseDto> {
    const supplier = await this.supplierModel.findById(id).exec();
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return this.toResponse(supplier);
  }

  async getAll(): Promise<SupplierResponseDto[]> {
    const suppliers = await this.supplierModel.find().exec();
    return suppliers.map((supplier) => this.toResponse(supplier));
  }

  private toResponse(supplier: Supplier): SupplierResponseDto {
    return {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone ?? null,
      address: supplier.address ?? null,
      notes: supplier.notes ?? null,
    };
  }
}
