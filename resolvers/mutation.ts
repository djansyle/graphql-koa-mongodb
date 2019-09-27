import mongoose from 'mongoose';

import AccountModel from '../models/Account';

const Mutation = {
    createAccount(parent, { data }, ctx, info) {
        const account = new AccountModel({
            balance: data.balance,
            context: data.context
        }).save();

        return account;
    },
    async updateBalance(parent, { account, delta }, ctx, info) {
        try {
            const accountId = mongoose.Types.ObjectId(account);
            const accountInfo = await AccountModel.findById(accountId);

            if (!accountInfo) throw new Error('Account not found.');

            if(delta) {
                
                accountInfo.balance += delta;
                await AccountModel.updateOne({_id: accountId}, {
                    $set: { 'balance': accountInfo.balance}
                })
                return true;

            }
            return false;
        } catch (err) {
            throw new Error(err.message)
        }
    },
    async createReservedBalance(parent, { account, context, amount }, ctx, info) {
        const accountId = mongoose.Types.ObjectId(account);

        const accountInfo = await AccountModel.findById(accountId);

        if (!accountInfo) throw new Error('Account not found.');

        if (amount > accountInfo.balance) throw new Error('Amount exceeds account balance.');
        const newBalance = accountInfo.balance - amount;

        if (context && amount) {
            const updateAccount = await AccountModel.updateOne({_id: accountId}, {
                $set: {
                    'balance': Number(newBalance).toFixed(2),
                    'reserved_balance': Number(amount).toFixed(2),
                    'context': context
                }
            });
            
           if (updateAccount.nModified === 1) {
               return true;
           }
           return false;
        }
    },
    async updateReservedBalance(parent, { account, context, delta }, ctx, info) {
        const accountId = mongoose.Types.ObjectId(account);
        
        const accountInfo = await AccountModel.findById(accountId);

        if (!accountInfo) throw new Error('Account not found.');

        const newReservedBalance = accountInfo.reserved_balance + delta;

        if (newReservedBalance < 0) throw new Error('Delta exceeds reserved balance.')

        const updateReservedBalance = await AccountModel.updateOne({_id: accountId}, {
            $set: {
                'reserved_balance': Number(newReservedBalance).toFixed(2),
                'context': context
            }
        })

        if (updateReservedBalance.nModified === 1) {
            return true;
        }
        return false;
    },
    async releaseReservedBalance(parent, { account, context }, ctx, info) {
        const accountId = mongoose.Types.ObjectId(account);

        const accountInfo = await AccountModel.findById(accountId);

        if (!accountInfo) throw new Error('Account not found.');

        const releasedBalance = accountInfo.balance + accountInfo.reserved_balance;

        const onReleaseBalance = await AccountModel.updateOne({_id: accountId}, {
            $set: {
                'reserved_balance': 0,
                'balance': Number(releasedBalance).toFixed(2),
                'context': context
            }
        });

        if (onReleaseBalance.nModified === 1) {
            return true;
        }
        return false;
    },
    async updateVirtualBalance(parent, { account, context, delta }, ctx, info) {
        const accountId = mongoose.Types.ObjectId(account);

        const accountInfo = await AccountModel.findById(accountId);

        if (!accountInfo) throw new Error('Account not found.');

        if (delta) {
            accountInfo.virtual_balance += delta;

            await AccountModel.updateOne({_id: accountId}, {
                $set: {
                    'virtual_balance': Number(accountInfo.virtual_balance).toFixed(2),
                    'context': context
                }
            })
            return true;
        }
        return false;

    },
    async cancelVirtualBalance(parent, { account, context }, ctx, info) {
        const accountId = mongoose.Types.ObjectId(account);

        const accountInfo = await AccountModel.findById(accountId);

        if (!accountInfo) throw new Error('Account not found.');

        const onCancelVirtualBalance = await AccountModel.updateOne({_id: accountId}, {
            $set: {
                'virtual_balance': 0,
                'context': context
            }
        })

        if (onCancelVirtualBalance.nModified === 1) {
            return true;
        }
        return false;
    },
    async commitVirtualBalance(parent, { account, context }, ctx, info) {
        const accountId = mongoose.Types.ObjectId(account);

        const accountInfo = await AccountModel.findById(accountId);

        if (!accountInfo) throw new Error('Account not found.');

        const releaseVirtualBalance = accountInfo.balance + accountInfo.virtual_balance;

        const onCommitVirtualBalance = await AccountModel.updateOne({_id: accountId}, {
            $set: {
                'virtual_balance': 0,
                'context': context,
                'balance': Number(releaseVirtualBalance).toFixed(2)
            }
        })

        if (onCommitVirtualBalance.nModified === 1) {
            return true;
        }
        return false;
    }
}

export { Mutation as default };