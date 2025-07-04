import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

interface UserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  surname: string;
  password: string;
  email: string;
  dateOfSubscribe?: string;
  _sessionToken?: string;
}

export const UserSchema = new Schema<UserDocument>({
  name: { type: String, require: true },
  surname: { type: String, require: true },
  password: { type: String, require: true },
  email: { type: String, require: true },
  dateOfSubscribe: { type: String, require: false },
  _sessionToken: { type: String, require: false }
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
  let res: boolean = false;
  bcrypt.compare(password, this.password, (err, result) => {
    if (result) res = true;
  });
  return res;
};

export const getUserBySessionToken = (sessionToken: string) => User.findOne({
  _sessionToken: sessionToken
}); 

export const User = mongoose.model<UserDocument>("User", UserSchema);