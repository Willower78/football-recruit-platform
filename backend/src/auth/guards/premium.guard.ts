import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwtUser = request.user;
    if (!jwtUser) {
      throw new ForbiddenException('Authentication required');
    }
    const user = await this.userRepo.findOneBy({ id: jwtUser.sub });
    if (!user || user.subscriptionPlan !== 'premium') {
      throw new ForbiddenException(
        'This feature requires a Premium subscription. Upgrade for €5/month.',
      );
    }
    return true;
  }
}
