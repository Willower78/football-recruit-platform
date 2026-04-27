import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { PostLike } from '../entities/post-like.entity';
import { PostComment } from '../entities/post-comment.entity';
import { Follow } from '../entities/follow.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(PostLike) private readonly likeRepo: Repository<PostLike>,
    @InjectRepository(PostComment) private readonly commentRepo: Repository<PostComment>,
    @InjectRepository(Follow) private readonly followRepo: Repository<Follow>,
    private readonly dataSource: DataSource,
  ) {}

  async createPost(authorId: string, dto: CreatePostDto): Promise<Post> {
    const post = this.postRepo.create({
      authorId,
      content: dto.content,
      mediaUrl: dto.mediaUrl ?? null,
      mediaType: dto.mediaType ?? null,
      visibility: dto.visibility ?? 'public',
    });
    return this.postRepo.save(post);
  }

  async getFeed(userId: string | null, page = 1, limit = 20) {
    const qb = this.postRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.author', 'author')
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (userId) {
      qb.where(
        "(p.visibility = 'public') OR (p.author_id = :userId) OR " +
          "(p.visibility = 'followers' AND p.author_id IN " +
          "(SELECT following_id FROM follows WHERE follower_id = :userId))",
        { userId },
      );
    } else {
      qb.where("p.visibility = 'public'");
    }

    const [items, total] = await qb.getManyAndCount();

    let likedPostIds: string[] = [];
    if (userId && items.length > 0) {
      const likes = await this.likeRepo.find({
        where: items.map((p) => ({ postId: p.id, userId })),
        select: ['postId'],
      });
      likedPostIds = likes.map((l) => l.postId);
    }

    return {
      items: items.map((p) => ({
        id: p.id,
        content: p.content,
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaType,
        visibility: p.visibility,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        createdAt: p.createdAt,
        liked: likedPostIds.includes(p.id),
        author: {
          id: p.author.id,
          email: p.author.email,
          role: p.author.role,
        },
      })),
      total,
      page,
      limit,
    };
  }

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.dataSource.transaction(async (manager) => {
      const likeRepo = manager.getRepository(PostLike);
      const postRepo = manager.getRepository(Post);

      const existing = await likeRepo.findOne({ where: { postId, userId } });
      if (existing) {
        const result = await likeRepo.delete({ postId, userId });
        if (result.affected && result.affected > 0) {
          await postRepo.decrement({ id: postId }, 'likesCount', 1);
        }
        return { liked: false };
      } else {
        try {
          await likeRepo.insert({ postId, userId });
          await postRepo.increment({ id: postId }, 'likesCount', 1);
        } catch (err: unknown) {
          const dbErr = err as { code?: string };
          if (dbErr.code === '23505') {
            return { liked: true };
          }
          throw err;
        }
        return { liked: true };
      }
    });
  }

  async addComment(postId: string, authorId: string, dto: CreateCommentDto) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = await this.commentRepo.save(
      this.commentRepo.create({ postId, authorId, content: dto.content }),
    );
    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);
    return comment;
  }

  async getComments(postId: string, page = 1, limit = 20) {
    const [items, total] = await this.commentRepo.findAndCount({
      where: { postId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: { id: c.author.id, email: c.author.email, role: c.author.role },
      })),
      total,
      page,
      limit,
    };
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Not your post');
    await this.postRepo.remove(post);
  }

  async follow(followerId: string, followingId: string): Promise<{ following: boolean }> {
    if (followerId === followingId) throw new ForbiddenException('Cannot follow yourself');

    const existing = await this.followRepo.findOne({ where: { followerId, followingId } });
    if (existing) {
      await this.followRepo.remove(existing);
      return { following: false };
    } else {
      await this.followRepo.save(this.followRepo.create({ followerId, followingId }));
      return { following: true };
    }
  }

  async getFollowers(userId: string) {
    const follows = await this.followRepo.find({
      where: { followingId: userId },
      relations: ['follower'],
    });
    return follows.map((f) => ({
      id: f.follower.id,
      email: f.follower.email,
      role: f.follower.role,
    }));
  }

  async getFollowing(userId: string) {
    const follows = await this.followRepo.find({
      where: { followerId: userId },
      relations: ['following'],
    });
    return follows.map((f) => ({
      id: f.following.id,
      email: f.following.email,
      role: f.following.role,
    }));
  }
}
