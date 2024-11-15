import mongoose from 'mongoose';



const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    categories: {
        type: [String]
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;