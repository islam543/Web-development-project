const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const seedUsers = [
  ["Alex Johnson", "alexjohnson", "alex@asteria.social"],
  ["Sarah Chen", "sarahchen", "sarah@asteria.social"],
  ["Mike Rivera", "mikerivera", "mike@asteria.social"],
  ["Jane Doe", "janedoe", "jane@asteria.social"],
  ["Emily Davis", "emilydavis", "emily@asteria.social"],
  ["Noah Campbell", "noahcampbell", "noah@asteria.social"],
  ["Layla Hassan", "laylahassan", "layla@asteria.social"],
  ["Omar Rahman", "omarrahman", "omar@asteria.social"],
  ["Mira Patel", "mirapatel", "mira@asteria.social"],
  ["Daniel Brooks", "danielbrooks", "daniel@asteria.social"],
  ["Nina Cooper", "ninacooper", "nina@asteria.social"],
  ["Leo Garcia", "leogarcia", "leo@asteria.social"],
];

const sampleMessages = [
  "Shipping small improvements every day beats waiting for perfect.",
  "Design and engineering are strongest when they share one language.",
  "Accessibility is not a feature. It is a baseline.",
  "Building in public helps teams learn faster.",
  "Today I refactored a messy module into something readable.",
  "Pair programming sessions have improved our review quality a lot.",
  "A strong data model removes complexity from the UI layer.",
  "Good software feels calm even under heavy use.",
  "I finally replaced a brittle popup flow with a clean modal.",
  "Search is one of the most underrated product features.",
  "Debugging sessions are easier when logs are descriptive and structured.",
  "Performance work often starts with measuring the right thing.",
  "A simple seed script saves hours of testing pain.",
  "Prisma migrations make schema changes easier to reason about.",
  "Classy themes are mostly about restraint, spacing, and contrast.",
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  await prisma.like.deleteMany();
  await prisma.repost.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const users = [];
  for (const [name, username, email] of seedUsers) {
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash,
        bio: `Hi, I'm ${name}. I enjoy building thoughtful digital experiences.`,
      },
    });
    users.push(user);
  }

  const follows = new Set();
  for (const follower of users) {
    const followCount = randomInt(3, 8);
    for (let i = 0; i < followCount; i += 1) {
      const followee = randomPick(users);
      if (followee.id === follower.id) continue;
      follows.add(`${follower.id}:${followee.id}`);
    }
  }

  await prisma.follow.createMany({
    data: Array.from(follows).map((key) => {
      const [followerId, followeeId] = key.split(":");
      return { followerId, followeeId };
    }),
  });

  const createdPosts = [];
  for (const user of users) {
    const postCount = randomInt(5, 9);
    for (let i = 0; i < postCount; i += 1) {
      const post = await prisma.post.create({
        data: {
          authorId: user.id,
          content: `${randomPick(sampleMessages)} #${randomPick([
            "Build",
            "WebDev",
            "UX",
            "Data",
            "Design",
            "Teamwork",
            "Performance",
          ])}`,
          createdAt: new Date(Date.now() - randomInt(0, 110) * 24 * 60 * 60 * 1000),
        },
      });

      createdPosts.push(post);
    }
  }

  const replies = [];
  for (let i = 0; i < 120; i += 1) {
    const post = randomPick(createdPosts);
    const author = randomPick(users);
    replies.push({
      postId: post.id,
      authorId: author.id,
      content: randomPick([
        "Love this point.",
        "Great insight, thanks for sharing.",
        "I had the same experience this week.",
        "This is exactly what our team needed.",
        "Can you share more details?",
      ]),
      createdAt: new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000),
    });
  }

  await prisma.reply.createMany({
    data: replies,
  });

  const likes = new Set();
  for (let i = 0; i < 450; i += 1) {
    const user = randomPick(users);
    const post = randomPick(createdPosts);
    likes.add(`${user.id}:${post.id}`);
  }

  await prisma.like.createMany({
    data: Array.from(likes).map((key) => {
      const [userId, postId] = key.split(":");
      return { userId, postId };
    }),
  });

  const reposts = new Set();
  for (let i = 0; i < 130; i += 1) {
    const user = randomPick(users);
    const post = randomPick(createdPosts);
    reposts.add(`${user.id}:${post.id}`);
  }

  await prisma.repost.createMany({
    data: Array.from(reposts).map((key) => {
      const [userId, postId] = key.split(":");
      return { userId, postId };
    }),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
