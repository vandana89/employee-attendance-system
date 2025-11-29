const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo Connected");

    await User.deleteMany({});

    const users = [
      {
        name: "Manager One",
        email: "manager@example.com",
        password: "Manager@123",
        role: "manager",
        employeeId: "MGR001",
        department: "HR",
      },
      {
        name: "Employee One",
        email: "emp1@example.com",
        password: "Employee@123",
        role: "employee",
        employeeId: "EMP001",
        department: "Engineering",
      },
    ];

    await User.insertMany(users);
    console.log("Seed data inserted");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();

