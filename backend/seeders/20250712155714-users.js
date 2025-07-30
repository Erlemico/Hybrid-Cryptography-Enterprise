"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash("admin#1234", 10);

    await queryInterface.bulkInsert("Users", [
      {
        username: "cfo_user",
        password: password,
        role: "CFO",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "auditor_user",
        password: password,
        role: "Auditor",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "employee",
        password: password,
        role: "Employee",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", {
      username: ["cfo_user", "auditor_user", "employee"],
    });
  },
};