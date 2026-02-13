import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AppUser, AppUserSchema } from './schemas/user.schema';
import { JwtStrategy } from './jwt.strategy';
import { BootstrapService } from './bootstrap.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: AppUser.name, schema: AppUserSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'CHANGE_ME',
        signOptions: {
          expiresIn: `${config.get<number>('JWT_EXPIRES_MINUTES') ?? 120}m`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, BootstrapService],
  exports: [AuthService],
})
export class AuthModule {}
