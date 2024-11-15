import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import userRoute from "./routes/userRoute.js";
import accountRoute from "./routes/accountRoute.js";
import transactionRoute from "./routes/transactionRoute.js";
import categoryRoute from "./routes/categoryRoute.js";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/user", userRoute);
app.use("/account", accountRoute);
app.use("/transaction", transactionRoute);
app.use("/category", categoryRoute);



app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${"http://localhost:"+process.env.PORT}`);
});