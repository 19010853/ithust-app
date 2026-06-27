const mongoose = require('mongoose');

async function queryUsers() {
  try {
    const connAuth = await mongoose.createConnection('mongodb://127.0.0.1:27017/ithust-auth').asPromise();
    const connUsers = await mongoose.createConnection('mongodb://127.0.0.1:27017/ithust-users').asPromise();
    
    console.log('--- AUTH DB ---');
    const authCollections = await connAuth.db.listCollections().toArray();
    for (let c of authCollections) {
      if (/user|auth/i.test(c.name)) {
        console.log(`Data in ithust-auth -> ${c.name}:`);
        const data = await connAuth.db.collection(c.name).find({}).project({email: 1, username: 1, username_search: 1}).toArray();
        console.log(data);
      }
    }

    console.log('\n--- USERS DB ---');
    const usersCollections = await connUsers.db.listCollections().toArray();
    for (let c of usersCollections) {
      if (/user|buyer|seller/i.test(c.name)) {
        console.log(`Data in ithust-users -> ${c.name}:`);
        const data = await connUsers.db.collection(c.name).find({}).project({email: 1, username: 1, name: 1}).toArray();
        console.log(data);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

queryUsers();
