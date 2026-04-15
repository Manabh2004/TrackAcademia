const fs = require('fs');
const os = require('os');
const path = require('path');

function getLanIp() {
  const interfaces = os.networkInterfaces();

  for (const network of Object.values(interfaces)) {
    for (const address of network || []) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }

  return null;
}

const lanIp = getLanIp();

if (!lanIp) {
  console.error('No LAN IPv4 address found. Connect to a network and try again.');
  process.exit(1);
}

const envPath = path.join(__dirname, '..', '.env');
const apiUrl = `http://${lanIp}:5000/api`;

fs.writeFileSync(envPath, `EXPO_PUBLIC_API_URL=${apiUrl}\n`, 'utf8');

console.log(`Wrote ${envPath}`);
console.log(`EXPO_PUBLIC_API_URL=${apiUrl}`);
console.log('Restart Expo after running this script.');
