import { prisma } from "@/lib/prisma";

const userCardSelect = {
  id: true,
  name: true,
  username: true,
  bio: true,
  location: true,
  website: true,
  avatarUrl: true,
};

function normalizePost(post) {
  return {
    ...post,
    likedByViewer: post.likes?.length > 0,
    repostedByViewer: post.reposts?.length > 0,
  };
}

export async function getFeedPosts(viewerId) {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      author: { select: userCardSelect },
      _count: { select: { replies: true, likes: true, reposts: true } },
      likes: { where: { userId: viewerId }, select: { userId: true } },
      reposts: { where: { userId: viewerId }, select: { userId: true } },
    },
  });

  return posts.map(normalizePost);
}

export async function createPost({ authorId, content, imageUrl }) {
  return prisma.post.create({
    data: {
      authorId,
      content,
      imageUrl: imageUrl || null,
    },
  });
}

export async function getPostDetail(postId, viewerId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: userCardSelect },
      _count: { select: { replies: true, likes: true, reposts: true } },
      likes: { where: { userId: viewerId }, select: { userId: true } },
      reposts: { where: { userId: viewerId }, select: { userId: true } },
      replies: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: userCardSelect },
        },
      },
    },
  });

  return post ? normalizePost(post) : null;
}

export async function addReply({ postId, authorId, content }) {
  return prisma.reply.create({
    data: {
      postId,
      authorId,
      content,
    },
  });
}

export async function toggleLike({ postId, userId }) {
  const existing = await prisma.like.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  if (existing) {
    await prisma.like.delete({
      where: {
        userId_postId: { userId, postId },
      },
    });
    return { liked: false };
  }

  await prisma.like.create({
    data: { userId, postId },
  });

  return { liked: true };
}

export async function toggleRepost({ postId, userId }) {
  const existing = await prisma.repost.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  if (existing) {
    await prisma.repost.delete({
      where: {
        userId_postId: { userId, postId },
      },
    });
    return { reposted: false };
  }

  await prisma.repost.create({
    data: { userId, postId },
  });

  return { reposted: true };
}

export async function searchUsers({ query, viewerId }) {
  const searchText = query?.trim();

  const users = await prisma.user.findMany({
    where: {
      id: { not: viewerId },
      ...(searchText
        ? {
            OR: [
              { name: { contains: searchText } },
              { username: { contains: searchText } },
            ],
          }
        : {}),
    },
    take: 12,
    orderBy: { createdAt: "desc" },
    select: {
      ...userCardSelect,
      followers: {
        where: { followerId: viewerId },
        select: { followerId: true },
      },
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });

  return users.map((user) => ({
    ...user,
    isFollowedByViewer: user.followers.length > 0,
  }));
}

export async function getProfileByUsername({ username, viewerId }) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      ...userCardSelect,
      createdAt: true,
      followers: {
        where: { followerId: viewerId },
        select: { followerId: true },
      },
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
      posts: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: userCardSelect },
          _count: { select: { replies: true, likes: true, reposts: true } },
          likes: { where: { userId: viewerId }, select: { userId: true } },
          reposts: { where: { userId: viewerId }, select: { userId: true } },
        },
      },
    },
  });

  if (!user) return null;

  return {
    ...user,
    isFollowedByViewer: user.followers.length > 0,
    posts: user.posts.map(normalizePost),
  };
}

export async function toggleFollowByUsername({ viewerId, username }) {
  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!target) return { status: "not_found" };
  if (target.id === viewerId) return { status: "self" };

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followeeId: {
        followerId: viewerId,
        followeeId: target.id,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({
      where: {
        followerId_followeeId: {
          followerId: viewerId,
          followeeId: target.id,
        },
      },
    });
    return { status: "ok", following: false };
  }

  await prisma.follow.create({
    data: {
      followerId: viewerId,
      followeeId: target.id,
    },
  });

  return { status: "ok", following: true };
}

export async function getPlatformStats() {
  const [totalUsers, totalPosts, totalReplies, totalLikes, totalFollows] =
    await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.reply.count(),
      prisma.like.count(),
      prisma.follow.count(),
    ]);

  const [avgFollowersRow] = await prisma.$queryRaw`
    SELECT COALESCE(AVG(follower_count), 0) AS value
    FROM (
      SELECT u.id, COUNT(f.followerId) AS follower_count
      FROM "User" u
      LEFT JOIN "Follow" f ON f.followeeId = u.id
      GROUP BY u.id
    );
  `;

  const [avgPostsRow] = await prisma.$queryRaw`
    SELECT COALESCE(AVG(post_count), 0) AS value
    FROM (
      SELECT u.id, COUNT(p.id) AS post_count
      FROM "User" u
      LEFT JOIN "Post" p ON p.authorId = u.id
      GROUP BY u.id
    );
  `;

  const [avgLikesPerPostRow] = await prisma.$queryRaw`
    SELECT COALESCE(AVG(like_count), 0) AS value
    FROM (
      SELECT p.id, COUNT(l.userId) AS like_count
      FROM "Post" p
      LEFT JOIN "Like" l ON l.postId = p.id
      GROUP BY p.id
    );
  `;

  const [mostActiveRow] = await prisma.$queryRaw`
    SELECT
      u.id,
      u.name,
      u.username,
      COALESCE(p.post_count, 0) + COALESCE(r.reply_count, 0) AS activity
    FROM "User" u
    LEFT JOIN (
      SELECT authorId, COUNT(*) AS post_count
      FROM "Post"
      WHERE createdAt >= datetime('now', '-90 days')
      GROUP BY authorId
    ) p ON p.authorId = u.id
    LEFT JOIN (
      SELECT authorId, COUNT(*) AS reply_count
      FROM "Reply"
      WHERE createdAt >= datetime('now', '-90 days')
      GROUP BY authorId
    ) r ON r.authorId = u.id
    ORDER BY activity DESC
    LIMIT 1;
  `;

  const [mostFollowedRow] = await prisma.$queryRaw`
    SELECT
      u.id,
      u.name,
      u.username,
      COUNT(f.followerId) AS followers
    FROM "User" u
    LEFT JOIN "Follow" f ON f.followeeId = u.id
    GROUP BY u.id
    ORDER BY followers DESC
    LIMIT 1;
  `;

  return {
    totalUsers,
    totalPosts,
    totalReplies,
    totalLikes,
    totalFollows,
    avgFollowersPerUser: Number(avgFollowersRow?.value ?? 0),
    avgPostsPerUser: Number(avgPostsRow?.value ?? 0),
    avgLikesPerPost: Number(avgLikesPerPostRow?.value ?? 0),
    mostActiveUserLast90Days: mostActiveRow
      ? {
          name: mostActiveRow.name,
          username: mostActiveRow.username,
          activity: Number(mostActiveRow.activity ?? 0),
        }
      : null,
    mostFollowedUser: mostFollowedRow
      ? {
          name: mostFollowedRow.name,
          username: mostFollowedRow.username,
          followers: Number(mostFollowedRow.followers ?? 0),
        }
      : null,
  };
}
