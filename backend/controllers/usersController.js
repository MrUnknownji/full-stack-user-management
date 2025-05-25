import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(totalUsers / limit);

    return res
      .status(200)
      .json({
        Users: users,
        currentPage: page,
        totalPages: totalPages,
        totalUsers: totalUsers,
      });
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    return res
      .status(500)
      .json({
        message: "Error while trying to get all users",
        error: error.message,
      });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await User.findById(id);
    if (!response) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ User: response });
  } catch (error) {
    console.error("Error in getUser:", error.message);
    return res
      .status(500)
      .json({
        message: "Error while trying to get user info",
        error: error.message,
      });
  }
};

export const addUser = async (req, res) => {
  const userData = req.body;
  try {
    if (
      !userData.username ||
      !userData.name ||
      !userData.email ||
      userData.age === undefined ||
      userData.age === null
    )
      return res.status(400).json({ message: "Missing required fields" });
    if (
      typeof userData.age !== "number" ||
      isNaN(userData.age) ||
      userData.age < 0
    )
      return res.status(400).json({ message: "Invalid age" });

    const newUser = new User({
      ...userData,
      address: userData.address ?? "",
      married: userData.married ?? false,
    });

    await newUser.save();
    return res
      .status(201)
      .json({ newUser: newUser, message: "User created successfully" });
  } catch (error) {
    console.error("Error in addUser controller:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "Validation failed", errors: messages });
    }
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[duplicateField];
      return res
        .status(409)
        .json({
          message: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} '${duplicateValue}' already exists.`,
        });
    }
    return res
      .status(500)
      .json({ message: "An unexpected error occurred.", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const userData = req.body;
  try {
    if (
      userData.age !== undefined &&
      (typeof userData.age !== "number" ||
        isNaN(userData.age) ||
        userData.age < 0)
    )
      return res.status(400).json({ message: "Invalid age" });

    const updatedUser = await User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found for update" });
    return res
      .status(200)
      .json({ message: "User updated successfully", updatedUser: updatedUser });
  } catch (error) {
    console.error("Error in updateUser controller:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: "Validation failed", errors: messages });
    }
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[duplicateField];
      return res
        .status(409)
        .json({
          message: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} '${duplicateValue}' already exists.`,
        });
    }
    return res
      .status(500)
      .json({ message: "An unexpected error occurred.", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found for deletion" });
    return res
      .status(200)
      .json({ message: "User deleted successfully", deletedUser: deletedUser });
  } catch (error) {
    console.error("Error in deleteUser:", error.message);
    return res
      .status(500)
      .json({ message: "An unexpected error occurred.", error: error.message });
  }
};
