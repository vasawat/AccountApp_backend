import express from "express";
const router = express.Router();
import User from "../models/userModel.js";
import Account from "../models/accountModel.js";
import xlsx from 'xlsx';
import fs from 'fs';
import { Filter } from 'bad-words'
const filter = new Filter();

import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.YOUR_CLOUD_NAME,
    api_key: process.env.YOUR_API_KEY,
    api_secret: process.env.YOUR_API_SECRET
});

router.post("/addTransaction", upload.single('slipImage'), async (req, res) => {
    const {accountId} = req.body;
    if(!accountId) {
        res.status(404).send("Account not found")
        return
    }

    try {
        let data = {}
        for (const key in req.body) {
            if (req.body[key] !== undefined && req.body[key] !== null) {
                data[key] = req.body[key];
            }
        }
        data.note = filter.clean(data.note);

        const uploadImage = async (image) => {
            try {
                const result = await cloudinary.uploader.upload(image);
                return result.url;
            } catch (err) {
                throw err;
            }
        }
        if (req.file) {
            const filePath = req.file.path;
            data.slipImage = await uploadImage(filePath);
        } else {
            console.log("No file uploaded");
        }
    
        const Acc = await Account.findById(accountId);
        if (Acc) {
            Acc.transactions.push(data);
            await Acc.save();
            if(req.file) {
                res.status(200).send(`Transaction added successfully ${data.slipImage}` );
            }else{
                res.status(200).send("Transaction added successfully");
            }
            
        } else {
            res.status(404).send("Account not found.");
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error adding transaction", error });
    }

});

router.get("/:accountId", async (req, res) => {
    const accountId = req.params.accountId;
    const { page , limit } = req.body;
    if(!accountId) {
        res.status(404).send("Account not found")
        return
    }
    if(!page) {
        page = 1;
    }
    if(!limit) {
        limit = 5;
    }

    try {
        const acc = await Account.findById(accountId);

        if (acc) {
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const paginatedTransactions = acc.transactions.slice(startIndex, endIndex);

            res.status(200).json({
                transactions: paginatedTransactions,
                currentPage: parseInt(page),
                totalPages: Math.floor(acc.transactions.length / limit),
                totalTransactions: acc.transactions.length
            });
        } else {
            res.status(404).send("Account not found.");
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.post("/importExcel/:accountId", upload.single('file'), async (req, res) => {
    if (!req.params.accountId) {
        res.status(400).send({ message: "Account ID is required" });
        return
    }
    if (!req.file) {
        res.status(400).send({ message: "No file uploaded" });
        return
    }
    try {
        if (!req.file) {
            return res.status(400).send({ message: "No file uploaded" });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const accountId = req.params.accountId;
        const acc = await Account.findById(accountId);

        if (!acc) {
            return res.status(404).send("Account not found");
        }

        data.forEach(transaction => {
            acc.transactions.push({
                name: transaction.name,
                note: transaction.note || "",
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                date: new Date
            });
        });

        await acc.save();

        fs.unlinkSync(req.file.path);

        res.status(200).send({ message: "File uploaded and data saved" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Error uploading file", error: err.message });
    }
});

router.get("/exportExcel/:accountId", async (req, res) => {
    if(!req.params.accountId) {
        res.status(404).send("Account not found")
        return
    }
    try {
        const accountId = req.params.accountId;
        const acc = await Account.findById(accountId);

        if (!acc) {
            return res.status(404).send("User not found");
        }

        if (!acc.transactions || acc.transactions.length === 0) {
            return res.status(404).send("No transactions found for this Account");
        }

        const workbook = xlsx.utils.book_new();

        const transactionsData = acc.transactions.map(transaction => ({
            Name: transaction.name,
            Note: transaction.note || "", 
            Amount: transaction.amount,
            Type: transaction.type,
            Category: transaction.category,
            SlipImage: transaction.slipImage || "",
            Date: transaction.date,
        }));

        const worksheet = xlsx.utils.json_to_sheet(transactionsData);

        xlsx.utils.book_append_sheet(workbook, worksheet, "Transactions");

        const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=transactions_${Date.now()}.xlsx`);
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Error exporting file", error: err.message });
    }
});

router.post("/summarize/:accountId", async (req, res)=> {
    const accountId = req.params.accountId;
    const { startDate, endDate, category} = req.body;
    if(!accountId) {
        res.status(404).send("Account not found")
        return
    }
    let start = new Date();
    let end = new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    if (startDate) {
        start = new Date(Date.UTC(new Date(startDate).getUTCFullYear(), new Date(startDate).getUTCMonth(), new Date(startDate).getUTCDate() + 1));
    }
    if (endDate) {
        end = new Date(Date.UTC(new Date(endDate).getUTCFullYear(), new Date(endDate).getUTCMonth(), new Date(endDate).getUTCDate() + 1, 23, 59, 59));
    }
    try {
        const acc = await Account.findById(accountId);
        if (acc) {
            let transactions = acc.transactions;

            console.log("Transaction Date:", transactions[0]?.date);
            console.log("Start Date:", start);
            console.log("End Date:", end);

            transactions = transactions.filter(transaction => {
                const transactionDate = transaction.date;
                return transactionDate >= start && transactionDate <= end;
            });

            if (category) {
                transactions = transactions.filter(transaction => transaction.category === category);
            }

            const allIncomeAmount = await transactions.filter(transaction => transaction.type === "income").reduce((total, transaction) => total + transaction.amount, 0);
            const allExpenseAmount = await transactions.filter(transaction => transaction.type === "expenses").reduce((total, transaction) => total + transaction.amount, 0);
            
            const summary = {
                totalIncome: allIncomeAmount,
                totalExpense: allExpenseAmount,
                totalAmount: allIncomeAmount - allExpenseAmount
            };
            res.status(200).json(summary);
        } else {
            res.status(404).send("Account not found.");
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error", error });
    }
})

export default router;