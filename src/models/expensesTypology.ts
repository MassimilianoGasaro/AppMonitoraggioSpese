import mongoose, { Schema, Document, Model } from "mongoose";

interface IExpenseType extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    type: 'income' | 'expense';
    isActive: boolean;
}

// Interfaccia per i metodi statici
interface IExpenseTypeModel extends Model<IExpenseType> {
    findByType(type: 'income' | 'expense'): Promise<IExpenseType[]>;
    findActive(): Promise<IExpenseType[]>;
    findActiveByType(type: 'income' | 'expense'): Promise<IExpenseType[]>;
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
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense'],
        default: 'expense'
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true
});

// Indice per migliorare le performance delle query per isActive e type
// Il campo name ha già un indice automatico grazie a unique: true
ExpenseTypeSchema.index({ isActive: 1 });
ExpenseTypeSchema.index({ type: 1 });
ExpenseTypeSchema.index({ type: 1, isActive: 1 }); // Indice composto per query combinate

// Metodi statici per query comuni
ExpenseTypeSchema.statics.findByType = function(type: 'income' | 'expense') {
    return this.find({ type }).sort({ name: 1 });
};

ExpenseTypeSchema.statics.findActive = function() {
    return this.find({ isActive: true }).sort({ type: 1, name: 1 });
};

ExpenseTypeSchema.statics.findActiveByType = function(type: 'income' | 'expense') {
    return this.find({ type, isActive: true }).sort({ name: 1 });
};

export const ExpenseType = mongoose.model<IExpenseType, IExpenseTypeModel>("ExpenseType", ExpenseTypeSchema);