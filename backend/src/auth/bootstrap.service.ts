import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Role } from './roles.enum';

@Injectable()
export class BootstrapService implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.authService.ensureBootstrapUser(
      this.configService.get('BOOTSTRAP_ADMIN_USERNAME') ?? 'admin',
      this.configService.get('BOOTSTRAP_ADMIN_PASSWORD') ?? 'admin12345',
      [Role.ADMIN],
    );
    await this.authService.ensureBootstrapUser(
      this.configService.get('BOOTSTRAP_STAFF_USERNAME') ?? 'staff',
      this.configService.get('BOOTSTRAP_STAFF_PASSWORD') ?? 'staff12345',
      [Role.STAFF],
    );
  }
}
