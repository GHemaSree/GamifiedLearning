const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.log("Usage: node promoteAdmin.js <email>");
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("Error: MONGO_URI is not set in environment or .env file.");
  process.exit(1);
}

// Support SRV dns resolution
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

mongoose.connect(mongoUri)
  .then(async () => {
    const targetEmail = email.toLowerCase().trim();
    const user = await User.findOneAndUpdate(
      { email: targetEmail },
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      console.log(`Error: User with email "${email}" not found in database.`);
    } else {
      console.log(`Success: "${user.name}" (${user.email}) is now an admin!`);
    }
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
