import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import mongodbConnection from "./db/index.js"
import { userRouter } from "./routers/userRouter.js"

dotenv.config({
    path:".env"
})

const app = express()

app.use(cors({
    origin:"*",
    credentials:true,
    methods:["POST", "GET", "PUT", "DELETE", "PUTCH"]
    
}))

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use("/api/v1",userRouter)

mongodbConnection()
try {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
}

