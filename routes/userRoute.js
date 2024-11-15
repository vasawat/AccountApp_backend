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

})

router.post("/register", (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) {
        res.status(400).send("Email and Password are required")
        return
    }

    bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
            console.log(err);
        }
        const user = await User.create({
            email,
            category: ["food", "transport", "entertainment"],
            password: hash
        }).then(() => {
            res.status(201).send(user);
        }).catch((err) => {
            res.status(500).send("this email already exists")
        })
        
    })
})

router.delete("/delete", async (req, res) => {
    const {userId} = req.body;
    if(!userId) {
        res.status(404).send("User not found")
        return
    }else {
        await User.findByIdAndDelete(userId).then(() => {
            res.status(200).send("User deleted successfully")
        }).catch((err) => {
            res.status(500).send("Invalid User Id")
        })
    }

    

})




export default router