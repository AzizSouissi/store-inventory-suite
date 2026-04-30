import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { DashboardResponseDto } from "./dashboard.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "../auth/roles.enum";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: "Get dashboard data",
    description:
      "Retrieves comprehensive dashboard data including stats, charts, and paginated tables",
  })
  @ApiResponse({
    status: 200,
    description: "Dashboard data retrieved successfully",
    type: DashboardResponseDto,
  })
  getDashboard(): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboard();
  }
}
