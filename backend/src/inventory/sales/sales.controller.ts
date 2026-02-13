import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../auth/roles.enum";
import { SalesService } from "./sales.service";
import { SaleCreateDto } from "./dto/sale-create.dto";
import { SaleResponseDto } from "./dto/sale-response.dto";

@Controller("sales")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  create(
    @Body() request: SaleCreateDto,
    @Req() req: { user?: { username?: string } },
  ): Promise<SaleResponseDto> {
    const performedBy = req.user?.username ?? "system";
    return this.salesService.create(request, performedBy);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  getAll(
    @Query("page") page = "0",
    @Query("size") size = "20",
    @Query("productId") productId?: string,
  ): Promise<{
    content: SaleResponseDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    return this.salesService.getAll(Number(page), Number(size), productId);
  }
}
