const prisma = require("../prisma/prismaClient/prismaClient");
const userAdmin = require("./seeder/userAdmin.seed");

async function main() {
  await userAdmin;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
