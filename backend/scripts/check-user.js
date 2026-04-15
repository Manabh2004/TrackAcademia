require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../src/models');

async function main() {
  const email = process.argv[2];
  if (!email) { console.log('Usage: node check-user.js email@example.com'); process.exit(1); }
  
  await sequelize.authenticate();
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    console.log('User NOT found in database');
  } else {
    console.log('User found:');
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Password hash: ${user.password}`);
    
    const testPasswords = ['admin123', 'changeme123', 'password', '123456'];
    for (const p of testPasswords) {
      const match = await bcrypt.compare(p, user.password);
      if (match) console.log(`  Password matches: "${p}"`);
    }
  }
  
  await sequelize.close();
}

main().catch(console.error);