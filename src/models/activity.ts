import mongoose, { ObjectId, Schema } from "mongoose";

interface IActivity {
    name: string;
    amount: number;
    description?: string;
    date: string;
    type: string;
    user_id: ObjectId;
}

const ActivitySchema = new Schema<IActivity>({
    name: { type: String, require: true },
    amount: { type: Number, require: true },
    description: { type: String, require: false },
    date: { type: String, require: true },
    type: { type: String, require: true },
    user_id: { type: Schema.ObjectId, require: true }
});

export const Activity = mongoose.model("Activity", ActivitySchema);

