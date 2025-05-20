const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

async function checkUsers() {
    try {
        console.log('Connecting to MongoDB...');
        const client = await MongoClient.connect(mongoURI);
        const db = client.db('biobloom');
        const users = db.collection('users');

        console.log('\nList of all users:');
        const allUsers = await users.find({}).toArray();
        
        if (allUsers.length === 0) {
            console.log('No users found in the database.');
        } else {
            allUsers.forEach(user => {
                console.log('\nUser Details:');
                console.log(JSON.stringify(user, null, 2));
                console.log('------------------------');
            });
        }

        await client.close();
        console.log('\nTotal users:', allUsers.length);
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUsers(); 