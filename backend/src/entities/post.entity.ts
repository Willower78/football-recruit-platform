import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type PostVisibility = 'public' | 'followers' | 'private';
export type MediaType = 'video' | 'image';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'author_id', type: 'uuid' })
  authorId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Column({ type: 'text', default: '' })
  content!: string;

  @Column({ name: 'media_url', type: 'varchar', length: 1024, nullable: true })
  mediaUrl!: string | null;

  @Column({ name: 'media_type', type: 'varchar', length: 20, nullable: true })
  mediaType!: MediaType | null;

  @Column({ type: 'varchar', length: 20, default: 'public' })
  visibility!: PostVisibility;

  @Column({ name: 'likes_count', type: 'integer', default: 0 })
  likesCount!: number;

  @Column({ name: 'comments_count', type: 'integer', default: 0 })
  commentsCount!: number;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
