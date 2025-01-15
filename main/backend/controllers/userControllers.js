import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../config/generateToken.js";

const colorCombinations = [
  "6c63ff",
  "ff6f61",
  "ffd700",
  "00bfff",
  "4caf50",
  "ff5722",
  "795548",
  "9c27b0",
  "7A8B1B",
  "3f51b5",
];

const generateAvatarURL = (name) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const backgroundColor =
    colorCombinations[Math.floor(Math.random() * colorCombinations.length)];
  const textColor = "ffffff";
  const fontSize = 90;

  const placeholderURL1 = `https://placehold.jp/${fontSize}/${backgroundColor}/${textColor}/150x150.png?text=${initials}`;

  return placeholderURL1;
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, photo } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter All The Mandatory Fields");
  }
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const finalPhoto = photo === "" ? generateAvatarURL(name) : photo;

  const user = await User.create({
    name: name,
    email: email,
    password: password,
    photo: finalPhoto,
  });
  console.log("user created: ", user);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create User");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Email id or Password");
  }
});
// api/user?search=username
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

const renameName = asyncHandler(async (req, res) => {
  const { userId, userName } = req.body;

  console.log("i am updating this")

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      name: userName,
    },
    {
      new: true,
    }
  )
  if (!updatedUser) {
    res.status(404);
    throw new Error("User Not Found");
  } else {
    res.json(updatedUser);
  }
});
const updatePicture = asyncHandler(async (req, res) => {
  const { userId, userPhoto } = req.body;

  console.log("i am updating photo")

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      photo: userPhoto,
    },
    {
      new: true,
    }
  )
  if (!updatedUser) {
    res.status(404);
    throw new Error("User Not Found");
  } else {
    res.json(updatedUser);
  }
});
export { registerUser, authUser, allUsers, renameName, updatePicture };
