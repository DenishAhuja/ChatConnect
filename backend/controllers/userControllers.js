const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const User = require("../models/userModel");

const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  //if anything is undefined then im throwing error
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter All the fields");
  }

  //findOne is a query for mongodb
  const userExists = await User.findOne({ email }); //User is a model
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  //if user doesnt exist
  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  //if the info is been added to the user obj then we got it thaty code is 201
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      password: user.password,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("failed to create a new user");
  }
});

const authUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      password: user.password,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("invalid info, try again");
  }
});

///

const allUsers = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  //this user will return all other user except the self use one $ne means not
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public

////
module.exports = { allUsers, registerUser, authUser };
