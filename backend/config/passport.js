import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendGoogleLoginConfirmation } from '../utils/mailer.js';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export default function (passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      let user = await User.findOne({ email });
      const isNew = !user;
      if (user) {
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
      } else {
        user = await User.create({
          name: profile.displayName,
          email: email || `${profile.id}@google.com`,
          googleId: profile.id,
        });
      }
      const token = generateToken(user._id);
      if (email) sendGoogleLoginConfirmation(email, user.name);
      return done(null, { user, token });
    } catch (err) {
      return done(err, null);
    }
  }));

  passport.serializeUser((data, done) => done(null, data));
  passport.deserializeUser((data, done) => done(null, data));
}
