import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId && !this.githubId;
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    googleId: String,
    githubId: String,
    profilePicture: String,
    
    // Security fields
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    lastLogin: Date,
    
    // Password reset
    resetToken: String,
    resetTokenExpiry: Date,
    
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

userSchema.index({ googleId: 1 });
userSchema.index({ githubId: 1 });
userSchema.index({ resetToken: 1 });

// Update timestamp on save
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
