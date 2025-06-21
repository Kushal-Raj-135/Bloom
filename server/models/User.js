import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: String,
    email: { 
        type: String, 
        unique: true 
    },
    password: String,
    googleId: String,
    githubId: String,
    profilePicture: String,
    resetToken: String,
    resetTokenExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
