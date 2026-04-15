require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../src/models');

async function main() {
  await sequelize.authenticate();
  console.log('DB connected');

  const email = 'admin@trackacademia.com';
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);

  const [user, created] = await User.upsert({
    name: 'Super Admin',
    email,
    password: hash,
    role: 'admin',
  });

  if (created) {
    console.log('Admin created!');
  } else {
    console.log('Admin already existed, password reset to admin123');
  }

  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  await sequelize.close();
}

main().catch(e => { console.error(e); process.exit(1); });