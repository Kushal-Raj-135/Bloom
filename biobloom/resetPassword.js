const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;

async function resetPassword(email, newPassword) {
    try {
        console.log('Connecting to MongoDB...');
        const client = await MongoClient.connect(mongoURI);
        const db = client.db('biobloom');
        const users = db.collection('users');

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        const result = await users.updateOne(
            { email },
            { 
                $set: { 
                    password: hashedPassword,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            console.log('No user found with that email.');
        } else if (result.modifiedCount === 1) {
            console.log('Password reset successful!');
        } else {
            console.log('Password was not modified.');
        }

        await client.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Reset password for the user
const email = 'hi@gmail.com';  // The email from your database
const newPassword = 'newpassword123';  // The new password you want to set

resetPassword(email, newPassword); 