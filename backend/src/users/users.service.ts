import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(input: {
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<User> {
    const user = this.users.create({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role,
      status: 'active',
      subscriptionPlan: 'free',
    });
    return this.users.save(user);
  }
}
