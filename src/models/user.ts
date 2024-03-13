import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// Interfaccia per definire i tipi per l'utente
interface IUser {
  email: string;
  password: string;
  // Altri campi dell'utente, se necessario
}

// Interfaccia per definire i metodi del documento utente
export interface UserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema Mongoose per l'utente
const userSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
  // Altri campi dell'utente, se necessario
});

// Metodo per confrontare la password immagazzinata con quella fornita dall'utente
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Prima di salvare l'utente, cripta la password se è stata modificata
userSchema.pre<UserDocument>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Definisci e esporta il modello dell'utente
const User = mongoose.model<UserDocument>('User', userSchema);
export default User;
