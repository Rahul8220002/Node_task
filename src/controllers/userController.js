import { User } from "../models/userSchema.js";
import jwt from "jsonwebtoken";

const createUser = async (req, res) => {
  try {
    const { name, email, password, address, latitude, longitude, status } =
      req.body;
    if (!name || !email || !password || !address || !longitude || longitude) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email." });
    }

    const user = await User.create({
      name,
      email,
      password,
      address,
      longitude,
      latitude,
      status,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Failed to create user", success: false });
    }

    const Token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
      },
      process.env.JWT_SERECT_KEY,
      { expiresIn: process.env.JWT_EXPIRES_KEY }
    );

    user.token = Token;
    await user.save();

    return res.status(200).json({
      status_code: 200,
      message: "User Create successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status_code: 500,
      message: "Something went wrong",
      success: false,
    });
  }
};

const changeUserStatus = async (req, res) => {
  try {
    const updatedata = await User.updateMany(
      { status: { $in: ["active", "inactive"] } },
      [
        {
          $set: {
            status: {
              $cond: [{ $eq: ["$status", "active"] }, "inactive", "active"],
            },
          },
        },
      ]
    );
    if (!updatedata) {
      return res.status(400).json({
        status_code: 400,
        message: "failed to update",
        success: false,
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: "update successfully",
      success: false,
      data: updatedata,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status_code: 500,
      message: "Something went wrong",
      success: false,
    });
  }
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

const getDistanceData = async (req, res) => {
  try {
    const distancelat = req.query.latitude;
    const distancelong = req.query.longitude;

    const user = req.user;
    const finduser = await User.findById(user._id);
    if (!user || !finduser.latitude || !finduser.longitude) {
      return res.status(400).json({
        status_code: 400,
        message: "location not found in token",
        success: false,
      });
    }
    const changeinlog = parseFloat(distancelong);
    const changeinlat = parseFloat(distancelat);

    if (!changeinlat || !changeinlog) {
      return res.status(400).json({
        status_code: 400,
        message: "latitude and longitude are required",
        success: false,
      });
    }

    const checkDistance = getDistanceFromLatLonInKm(
      finduser.latitude,
      finduser.longitude,
      changeinlog,
      changeinlat
    );

    return res.status(200).json({
      status_code: 200,
      message: "calculated successfully",
      distance: `${checkDistance} km`,
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: "Something went wrong",
      success: false,
    });
  }
};

const getAllUsersByDay = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: "$register_at" },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          dayOfWeek: 1,
        },
      },
    ]);

    const dayMap = {
      1: "sunday",
      2: "monday",
      3: "tuesday",
      4: "wednesday",
      5: "thursday",
      6: "friday",
      7: "saturday",
    };

    const grouped = {
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
    };

    for (const user of users) {
      const dayName = dayMap[user.dayOfWeek];
      grouped[dayName].push({ name: user.name, email: user.email });
    }

    return res.status(200).json({
      status_code: 200,
      message: "Users fetched successfully",
      data: grouped,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status_code: 500,
      message: "Server error",
    });
  }
};

export { createUser, changeUserStatus, getDistanceData, getAllUsersByDay };
