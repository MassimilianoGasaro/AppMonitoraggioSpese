import mongoose, { Schema, Document, Types, Model } from "mongoose";

interface IActivity extends Document {
    _id: Types.ObjectId;
    name: string;
    amount: number;
    description?: string;
    date: string;
    type: string;
    user_id: Types.ObjectId;
}

// Interfaccia per i metodi statici
interface IActivityModel extends Model<IActivity> {
    findByUser(userId: string): Promise<IActivity[]>;
    findByUserWithDetails(userId: string): Promise<IActivity[]>;
    getUserStats(userId: string): Promise<any>;
}

const ActivitySchema = new Schema<IActivity>({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: false },
    date: { type: String, required: true },
    type: { type: String, required: true },
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
        .sort({ date: -1 });
};

ActivitySchema.statics.getUserStats = async function(userId: string) {
    const activities = await this.find({ user_id: userId });
    
    const income = activities
        .filter((a: any) => a.type === 'entrata')
        .reduce((sum: number, a: any) => sum + a.amount, 0);
        
    const expenses = activities
        .filter((a: any) => a.type !== 'entrata')
        .reduce((sum: number, a: any) => sum + a.amount, 0);
    
    return {
        totalActivities: activities.length,
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        byType: activities.reduce((acc: any, activity: any) => {
            acc[activity.type] = (acc[activity.type] || 0) + activity.amount;
            return acc;
        }, {} as Record<string, number>)
    };
};

export const Activity = mongoose.model<IActivity, IActivityModel>("Activity", ActivitySchema);

// Funzioni di utilità semplificate
export const getActivitiesByUser = (userId: string) => {
    return Activity.find({ user_id: userId }).sort({ date: -1 });
};

export const getActivitiesWithUserDetails = (userId: string) => {
    return Activity.find({ user_id: userId })
        .populate('user_id', 'name surname email')
        .sort({ date: -1 });
};

export const getUserActivityStats = async (userId: string) => {
    const activities = await Activity.find({ user_id: userId });
    
    const income = activities
        .filter(a => a.type === 'entrata')
        .reduce((sum, a) => sum + a.amount, 0);
        
    const expenses = activities
        .filter(a => a.type !== 'entrata')
        .reduce((sum, a) => sum + a.amount, 0);
    
    const byType = activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + activity.amount;
        return acc;
    }, {} as Record<string, number>);
    
    return {
        totalActivities: activities.length,
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        byType
    };
};

