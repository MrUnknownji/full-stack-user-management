import {
  getAllUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";
import express from "express";

const userRouter = express.Router();
userRouter.route("/").get(getAllUsers).post(addUser);
userRouter.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

export default userRouter;
