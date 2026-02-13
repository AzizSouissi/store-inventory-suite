import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../schemas/category.schema';
import { CategoryCreateDto } from './dto/category-create.dto';
import { CategoryUpdateDto } from './dto/category-update.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Product } from '../schemas/product.schema';
import { scaleThreshold } from '../../common/utils/number-utils';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  async create(request: CategoryCreateDto): Promise<CategoryResponseDto> {
    const exists = await this.categoryModel.exists({
      name: new RegExp(`^${request.name}$`, 'i'),
    });
    if (exists) {
      throw new BadRequestException('Category name already exists');
    }

    const saved = await this.categoryModel.create({
      name: request.name.trim(),
      defaultLowStockThreshold: scaleThreshold(
        request.defaultLowStockThreshold,
      ),
    });

    return this.toResponse(saved);
  }

  async update(
    id: string,
    request: CategoryUpdateDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const newName = request.name.trim();
    if (category.name.toLowerCase() !== newName.toLowerCase()) {
      const exists = await this.categoryModel.exists({
        name: new RegExp(`^${newName}$`, 'i'),
      });
      if (exists) {
        throw new BadRequestException('Category name already exists');
      }
    }

    category.name = newName;
    category.defaultLowStockThreshold = scaleThreshold(
      request.defaultLowStockThreshold,
    );
    const saved = await category.save();
    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const exists = await this.categoryModel.exists({ _id: id });
    if (!exists) {
      throw new NotFoundException('Category not found');
    }

    const hasProducts = await this.productModel.exists({ categoryId: id });
    if (hasProducts) {
      throw new BadRequestException(
        'Cannot delete category while products reference it',
      );
    }

    await this.categoryModel.deleteOne({ _id: id }).exec();
  }

  async getById(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.toResponse(category);
  }

  async getAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryModel.find().exec();
    return categories.map((category) => this.toResponse(category));
  }

  private toResponse(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      defaultLowStockThreshold: category.defaultLowStockThreshold ?? null,
    };
  }
}
