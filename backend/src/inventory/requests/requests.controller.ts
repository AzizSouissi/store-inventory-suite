import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../auth/roles.enum';
import { RequestsService } from './requests.service';
import { RestockRequestDto } from './dto/restock-request.dto';
import { DamageReportDto } from './dto/damage-report.dto';
import { ProductSuggestionDto } from './dto/product-suggestion.dto';
import { ProductNoteDto } from './dto/product-note.dto';
import { RequestReviewDto } from './dto/request-review.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import { RequestStatus } from './enums/request-status.enum';
import { RequestType } from './enums/request-type.enum';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('restock')
  @Roles(Role.ADMIN, Role.STAFF)
  createRestock(
    @Body() request: RestockRequestDto,
    @Req() req: { user?: { username?: string } },
  ): Promise<RequestResponseDto> {
    const createdBy = req.user?.username ?? 'system';
    return this.requestsService.createRestockRequest(request, createdBy);
  }

  @Post('damage')
  @Roles(Role.ADMIN, Role.STAFF)
  createDamage(
    @Body() request: DamageReportDto,
    @Req() req: { user?: { username?: string } },
  ): Promise<RequestResponseDto> {
    const createdBy = req.user?.username ?? 'system';
    return this.requestsService.createDamageReport(request, createdBy);
  }

  @Post('product-suggestion')
  @Roles(Role.ADMIN, Role.STAFF)
  createProductSuggestion(
    @Body() request: ProductSuggestionDto,
    @Req() req: { user?: { username?: string } },
  ): Promise<RequestResponseDto> {
    const createdBy = req.user?.username ?? 'system';
    return this.requestsService.createProductSuggestion(request, createdBy);
  }

  @Post('product-note')
  @Roles(Role.ADMIN, Role.STAFF)
  createProductNote(
    @Body() request: ProductNoteDto,
    @Req() req: { user?: { username?: string } },
  ): Promise<RequestResponseDto> {
    const createdBy = req.user?.username ?? 'system';
    return this.requestsService.createProductNote(request, createdBy);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  getAll(
    @Query('page') page = '0',
    @Query('size') size = '20',
    @Query('status') status?: RequestStatus,
    @Query('type') type?: RequestType,
    @Query('productId') productId?: string,
    @Req() req: { user?: { username?: string; roles?: Role[] } },
  ): Promise<{
    content: RequestResponseDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    const roles = req.user?.roles ?? [];
    const isAdmin = roles.includes(Role.ADMIN);
    const username = req.user?.username ?? 'system';

    return this.requestsService.getAll(
      Number(page),
      Number(size),
      { status, type, productId },
      username,
      isAdmin,
    );
  }

  @Patch(':id/submit')
  @Roles(Role.ADMIN, Role.STAFF)
  submit(
    @Param('id') id: string,
    @Req() req: { user?: { username?: string; roles?: Role[] } },
  ): Promise<RequestResponseDto> {
    const roles = req.user?.roles ?? [];
    const isAdmin = roles.includes(Role.ADMIN);
    const username = req.user?.username ?? 'system';

    return this.requestsService.submitRequest(id, username, isAdmin);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  approve(
    @Param('id') id: string,
    @Body() review: RequestReviewDto,
    @Req() req: { user?: { username?: string } },
  ): Promise<RequestResponseDto> {
    const reviewedBy = req.user?.username ?? 'system';
    return this.requestsService.approveRequest(
      id,
      reviewedBy,
      review.reviewNote ?? null,
    );
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  reject(
    @Param('id') id: string,
    @Body() review: RequestReviewDto,
    @Req() req: { user?: { username?: string } },
  ): Promise<RequestResponseDto> {
    const reviewedBy = req.user?.username ?? 'system';
    return this.requestsService.rejectRequest(
      id,
      reviewedBy,
      review.reviewNote ?? null,
    );
  }
}
