import User from '../models/User.js';

/**
 * Handle Google OAuth authentication
 * @param {string} accessToken - OAuth access token
 * @param {string} refreshToken - OAuth refresh token
 * @param {Object} profile - User profile from Google
 * @param {Function} done - Callback function
 */
export const handleGoogleAuth = async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            // Check if user exists with same email
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                // Update existing user with Google ID
                user.googleId = profile.id;
                user.profilePicture = profile.photos[0].value;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    profilePicture: profile.photos[0].value
                });
            }
        }
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
};

/**
 * Handle GitHub OAuth authentication
 * @param {string} accessToken - OAuth access token
 * @param {string} refreshToken - OAuth refresh token
 * @param {Object} profile - User profile from GitHub
 * @param {Function} done - Callback function
 */
export const handleGithubAuth = async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
            user = await User.findOne({ email: profile.emails?.[0]?.value });

            if (user) {
                user.githubId = profile.id;
                user.profilePicture = profile.photos?.[0]?.value;
                await user.save();
            } else {
                user = await User.create({
                    name: profile.displayName || profile.username,
                    email: profile.emails?.[0]?.value || "",
                    githubId: profile.id,
                    profilePicture: profile.photos?.[0]?.value
                });
            }
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
};

export default {
    handleGoogleAuth,
    handleGithubAuth
};
