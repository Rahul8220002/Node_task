import { Router } from "express";
import { changeUserStatus, createUser, getAllUsersByDay, getDistanceData } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const userRouter= Router()

userRouter.post("/create", createUser)
userRouter.put("/update-status",auth, changeUserStatus)
userRouter.get("/check-distance", auth, getDistanceData);
userRouter.get("/users-by-days", auth, getAllUsersByDay);

export {userRouter}