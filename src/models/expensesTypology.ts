import mongoose, { Schema, Document } from "mongoose";

interface IExpenseType extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    isActive: boolean;
}

const ExpenseTypeSchema = new Schema<IExpenseType>({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    description: { 
        type: String, 
        required: false,
        trim: true 
    },
    icon: { 
        type: String, 
        required: false,
        default: '💰' 
    },
    color: { 
        type: String, 
        required: false,
        default: '#007bff' 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true
});

// Indice per migliorare le performance delle query per isActive
// Il campo name ha già un indice automatico grazie a unique: true
ExpenseTypeSchema.index({ isActive: 1 });

export const ExpenseType = mongoose.model<IExpenseType>("ExpenseType", ExpenseTypeSchema);