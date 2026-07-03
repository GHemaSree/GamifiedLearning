const mongoose = require('mongoose');
const dns = require('dns');

// Many ISP/router DNS resolvers (common in India) refuse SRV-type queries,
// which is what "mongodb+srv://" needs to find the cluster. That shows up
// as "querySrv ECONNREFUSED ..." even though the cluster is healthy and
// reachable. Pointing Node at a public resolver that supports SRV fixes it.
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Also prefer IPv4 — some ISPs hand out unroutable IPv6 for Atlas hosts.
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set. Check your .env file.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast instead of hanging
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed.');
    console.error(`  name: ${error.name}`);
    console.error(`  message: ${error.message}`);

    if (error.name === 'MongooseServerSelectionError') {
      console.error(
        '  -> Likely cause: your current IP is not whitelisted in Atlas ' +
        '(Network Access), or a network/DNS block is preventing the SRV lookup.'
      );
    } else if (/auth/i.test(error.message)) {
      console.error(
        '  -> Likely cause: wrong username/password, or the DB user lacks ' +
        'access to this cluster (check Atlas Database Access).'
      );
    }

    process.exit(1);
  }
};

module.exports = connectDB;