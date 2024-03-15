import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

interface UserDocument extends Document {
    username: string;
    password: string;
    email: string;
    dateOfSubscribe?: string;
}

const UserSchema = new Schema<UserDocument>({
    username: { type: String, require: true },
    password: { type: String, require: true },
    email: { type: String, require: true },
    dateOfSubscribe: { type: String, require: false },
});

// Middleware per hashare la password prima di salvarla nel database
UserSchema.pre<UserDocument>('save', function (next) {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(this.password, salt);
    this.password = hash;
    next();
  });
  
  // Metodo per verificare la password
  UserSchema.methods.comparePassword = function (password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  };

export const User = mongoose.model<UserDocument>("User", UserSchema);