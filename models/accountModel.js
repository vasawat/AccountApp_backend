import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    note: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    slipImage: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const accountSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactions: {
        type: [transactionSchema]
    },
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

export default Account;