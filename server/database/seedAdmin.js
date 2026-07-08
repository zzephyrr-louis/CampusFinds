const bcrypt = require("bcryptjs");
const { get, run } = require("../db");

async function seedDefaultAdmin() {
  const existingAdmin = await get("SELECT user_id FROM Users WHERE role = 'admin' LIMIT 1");

  if (existingAdmin) {
    return;
  }

  const adminStudentId = process.env.ADMIN_STUDENT_ID || "ADMIN-0001";
  const adminFullname = process.env.ADMIN_FULLNAME || "CampusFind Administrator";
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@campusfind.edu").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await run(
    `INSERT INTO Users (student_id, fullname, email, password, role)
     VALUES (?, ?, ?, ?, 'admin')`,
    [adminStudentId, adminFullname, adminEmail, hashedPassword]
  );
}

module.exports = {
  seedDefaultAdmin,
};
