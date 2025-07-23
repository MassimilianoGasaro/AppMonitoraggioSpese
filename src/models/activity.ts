import mongoose, { Schema, Document, Types, Model } from "mongoose";

interface IActivity extends Document {
    _id: Types.ObjectId;
    name: string;
    amount: number;
    description?: string;
    date: string;
    type: Types.ObjectId;
    user_id: Types.ObjectId;
}

// Interfaccia per i metodi statici
interface IActivityModel extends Model<IActivity> {
    findByUser(userId: string): Promise<IActivity[]>;
    findByUserWithDetails(userId: string): Promise<IActivity[]>;
    findByUserWithFullDetails(userId: string): Promise<IActivity[]>;
    getUserStats(userId: string): Promise<any>;
}

const ActivitySchema = new Schema<IActivity>({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: false },
    date: { type: String, required: true },
    type: { 
        type: Schema.Types.ObjectId,
        ref: 'ExpenseType',
        required: true 
    },
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', // Reference al modello User
        required: true 
    }
}, {
    timestamps: true // Aggiunge createdAt e updatedAt automaticamente
});

// Indice per migliorare le performance delle query per user_id
ActivitySchema.index({ user_id: 1 });
ActivitySchema.index({ user_id: 1, date: -1 }); // Per ordinare per data

// Middleware per validare che l'utente esista prima di salvare
ActivitySchema.pre('save', async function(next) {
    const User = mongoose.model('User');
    const userExists = await User.findById(this.user_id);
    
    if (!userExists) {
        const error = new Error(`Utente con ID ${this.user_id} non trovato`);
        return next(error);
    }
    
    next();
});

// Metodi statici per query comuni
ActivitySchema.statics.findByUser = function(userId: string) {
    return this.find({ user_id: userId }).sort({ date: -1 });
};

ActivitySchema.statics.findByUserWithDetails = function(userId: string) {
    return this.find({ user_id: userId })
        .populate('user_id', 'name surname email') // Popola i dati dell'utente
        .populate('type', 'name description icon color') // Popola i dati del tipo di spesa
        .sort({ date: -1 });
};

ActivitySchema.statics.findByUserWithFullDetails = function(userId: string) {
    return this.find({ user_id: userId })
        .populate('user_id', 'name surname email') // Popola tutti i dati dell'utente
        .populate('type') // Popola tutti i dati del tipo di spesa
        .sort({ date: -1 });
};

ActivitySchema.statics.getUserStats = async function(userId: string) {
    // Usa populate per ottenere i dati del tipo di spesa incluso il campo 'type'
    const activities = await this.find({ user_id: userId })
        .populate('type', 'name type'); // Include sia name che type
    
    // Filtra usando la proprietà 'type' del ExpenseType invece del name
    const income = activities
        .filter((a: any) => a.type?.type === 'income')
        .reduce((sum: number, a: any) => sum + a.amount, 0);
        
    const expenses = activities
        .filter((a: any) => a.type?.type === 'expense')
        .reduce((sum: number, a: any) => sum + a.amount, 0);
    
    // Statistiche per tipo di spesa (raggruppate per nome del tipo)
    const byType = activities.reduce((acc: any, activity: any) => {
        const typeName = activity.type?.name || 'Sconosciuto';
        acc[typeName] = (acc[typeName] || 0) + activity.amount;
        return acc;
    }, {} as Record<string, number>);
    
    // Statistiche per categoria (entrata/uscita)
    const byCategory = activities.reduce((acc: any, activity: any) => {
        const category = activity.type?.type || 'sconosciuto';
        acc[category] = (acc[category] || 0) + activity.amount;
        return acc;
    }, {} as Record<string, number>);
    
    return {
        totalActivities: activities.length,
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        byType, // Statistiche per nome del tipo (es: "Alimentari", "Trasporti", "Stipendio")
        byCategory // Statistiche per categoria (es: "entrata", "uscita")
    };
};

export const Activity = mongoose.model<IActivity, IActivityModel>("Activity", ActivitySchema);

// NOTA: Usa i metodi statici del modello invece delle funzioni di utilità
// Esempi di utilizzo:
// - Activity.findByUser(userId)
// - Activity.findByUserWithDetails(userId) 
// - Activity.findByUserWithFullDetails(userId)
// - Activity.getUserStats(userId)

