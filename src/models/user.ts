import mongoose, { Schema } from "mongoose";

interface IUser {
  username?: string;
  email: string;
  dateOfSubscribe?: string;
  password: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: false },
  email: { type: String, required: true },
  password: { type: String, required: true },
  dateOfSubscribe: { type: String }
},{ collection: 'users' });

export const User = mongoose.model<IUser>("User", UserSchema);