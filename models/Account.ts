import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
    balance: {type: Number, default: 0},
    context: {type: String, default: null},
    reserved_balance: {type: Number, default: 0},
    virtual_balance: {type: Number, default: 0}
});

const AccountModel = mongoose.model('Account', AccountSchema);

export { AccountModel as default };