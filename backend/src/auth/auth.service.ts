import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AppUser } from './schemas/user.schema';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Role } from './roles.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AppUser.name) private readonly userModel: Model<AppUser>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(request: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.userModel
      .findOne({ username: request.username })
      .exec();
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const matches = await bcrypt.compare(request.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const expiresMinutes = Number(
      this.configService.get('JWT_EXPIRES_MINUTES') ?? 120,
    );
    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles ?? [],
    };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: `${expiresMinutes}m`,
    });

    const expiresAt = new Date(
      Date.now() + expiresMinutes * 60 * 1000,
    ).toISOString();

    return {
      token,
      tokenType: 'Bearer',
      expiresAt,
    };
  }

  async findByUsername(username: string): Promise<AppUser | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async ensureBootstrapUser(
    username: string,
    password: string,
    roles: Role[],
  ): Promise<void> {
    if (!username || !password) {
      return;
    }
    const exists = await this.userModel.exists({ username });
    if (exists) {
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await this.userModel.create({ username, passwordHash, roles });
  }
}
