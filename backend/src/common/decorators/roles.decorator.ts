import { SetMetadata } from '@nestjs/common';

export type AppRole = 'player' | 'club' | 'scout' | 'admin';
export const ROLES_KEY = 'roles';
export const Roles = (
  ...roles: AppRole[]
): MethodDecorator & ClassDecorator => SetMetadata(ROLES_KEY, roles);
