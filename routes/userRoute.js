import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import User from "../models/userModel.js"

const saltRounds = 10

router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) {
        res.status(400).send("Email and Password are required")
        return
    }

    try {
        const user = await User.findOne({email})

        if(user){
            bcrypt.compare(password, user.password, (err, result) =>{
                if(err) {
                    console.log(err)
                }
                if(result){
                    res.status(200).send(user)
                }else {
                    res.status(404).send("Invalid Password")
                }
            })
        }
    }catch (err) {
        res.status(500).send({message: "Server error", error: err})
    }   
});

router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("Email and Password are required");
    }

    try {
        const hash = await bcrypt.hash(password, saltRounds);
        const user = await User.create({
            email,
            category: ["food", "transport", "entertainment"],
            password: hash
        });

        res.status(201).send(user);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Server error", error: err });
    }
});


router.delete("/delete", async (req, res) => {
    const {userId} = req.body;
    if(!userId) {
        res.status(404).send("User not found")
        return
    }

    try {
        await User.findByIdAndDelete(userId)
        res.status(200).send("User deleted successfully")
        
    }catch (err) {
        res.status(500).send({message: "Server error", error: err})
    }

})




export default router