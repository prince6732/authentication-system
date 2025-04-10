const prisma = require("../prismaClient/prismaClient");
const bcrypt = require("bcryptjs");

async function userAdmin() {
const users = [
    {
      username: "admin",
      email: "admin@gmail.com",
      password: "root1234",
      role: "ADMIN", //assign role
      emailVerifiedAt: new Date(),
      isVerified: true,
      createdAt: new Date(),
    },
  ];

  // Encrypt passwords and seed data
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10); // Encrypt the password
    await prisma.users.upsert({
      where: { email: "admin@gmail.com" },
      update: {},
      create: {
        username: user.username,
        email: user.email,
        password: hashedPassword, // Store encrypted password
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  }
  console.log("Users seeded successfully!");
};

module.exports = userAdmin();

