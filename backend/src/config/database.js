const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const hasMysqlConfig = [
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_HOST,
].every(Boolean);

const useSqlite =
  process.env.DB_DIALECT === 'sqlite' ||
  !hasMysqlConfig;

const sequelize = useSqlite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: process.env.SQLITE_PATH || path.join(__dirname, '../../database.sqlite'),
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
      }
    );

module.exports = sequelize;
