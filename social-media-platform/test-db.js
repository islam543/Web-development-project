const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.user.count()
  .then(c => { console.log("Users in DB:", c); p.$disconnect(); })
  .catch(e => { console.error("DB Error:", e.message); p.$disconnect(); });