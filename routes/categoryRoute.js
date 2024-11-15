import express from "express";
const router = express.Router();
import User from "../models/userModel.js";

router.post("/add/:userId",async (req, res) => {
    const {userId} = req.params; 
    const {category} = req.body;
    if(!userId) {
        res.status(404).send("User not found")
        return
    }
    if(!category) {
        res.status(404).send("Category is required")
        return
    }

    const user = await User.findById(userId);
    if (user) {
        user.categories.push(category);
        user.save();
        res.status(200).send("Category added successfully");
    } else {
        res.status(404).send("User not found.");
    }
});

router.post("/delete/:userId", async (req, res) => {
    const {userId} = req.params; 
    const {category} = req.body;
    if(!userId) {
        res.status(404).send("User not found")
        return
    }
    if(!category) {
        res.status(404).send("Category is required")
        return
    }

    const user = await User.findById(userId);
    if (user) {
        const index = user.categories.indexOf(category);
        if (index > -1) {
            user.categories.splice(index, 1);
            user.save();
            res.status(200).send("Category deleted successfully");
        } else {
            res.status(404).send("Category not found.");
        }
    } else {
        res.status(404).send("User not found.");
    }
});

export default router;