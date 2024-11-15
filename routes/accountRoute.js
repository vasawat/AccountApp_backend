import express from "express";
const router = express.Router();
import Account from "../models/accountModel.js";

router.post("/add/:userId", async (req, res) => {
    const {userId} = req.params;
    const {name} = req.body;
    if(!userId) {
        res.status(404).send("User not found")
        return
    }
    if(!name) {
        res.status(404).send("Name is required")
        return
    }

    try {
        const account = new Account({
            name: name,
            owner: userId,
        });

        account.save();

        res.status(201).send(account);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server error", error: err });
    }

});

router.get("/:userId", async (req, res) => {
    const userId = req.params.userId;
    const { name } = req.body;
    if(!userId) {
        res.status(404).send("User not found")
        return
    }
    let query = {};
    if (name) {
        query.name = name;
    }
    if (userId) {
        query.owner = userId;
    }

    try {
        const accounts = await Account.find(query);
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }

});

router.delete("/delete/:Accountid", async (req, res) => {
    const {Accountid} = req.params;
    if(!Accountid) {
        res.status(404).send("Account not found")
        return
    }

    try{
        const acc = await Account.findById(Accountid);
        if(!acc) {
            res.status(404).send("Account not found");
            return
        }

        await Account.findByIdAndDelete(Accountid);
        res.status(200).send("Account deleted successfully");
    }catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

export default router;