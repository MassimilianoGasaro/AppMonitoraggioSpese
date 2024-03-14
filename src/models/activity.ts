import mongoose, { Schema, Types } from "mongoose";

interface IActivity {
    name: string;
    amount: number;
    date: string;
    notes: string;
    type: string;
    user_id: Schema.Types.ObjectId; // Riferimento all'ID dell'utente
}
  
const ActivitySchema = new Schema<IActivity>({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    notes: { type: String, required: true },
    type: { type: String, required: true },
    user_id: { type: Types.ObjectId, ref: 'User', required: true }
},{collection: "activities"});

export const Activity = mongoose.model("Activity", ActivitySchema);