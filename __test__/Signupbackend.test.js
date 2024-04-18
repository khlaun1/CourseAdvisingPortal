const bcrypt = require("bcrypt");

const db = require("../Database/db");
const { tableCreatorChecker } = require("../routes");

jest.mock("bcrypt");
jest.mock("../Database/db.js");

let req, res;

beforeEach(() => {
  req = {
    body: {
      username: "Test User",
      email: "rpatt012@odu.edu",
      password: "Password123!",
      firstName: "Test",
      lastName: "User",
    },
  };

  res = {
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

test("successfully inserts data when password is strong and email is unique", async () => {
  bcrypt.hash.mockResolvedValue("hashedPassword");

  //db.tableCreator.mockResolvedValue();
  //db.createCoursesTableIfNotExists.mockResolvedValue();
  //db.existenceChecker.mockResolvedValue(true);
  db.checkDuplicateEmail.mockResolvedValue(false);
  db.insertData.mockResolvedValue();

  await tableCreatorChecker(req, res);

  expect(res.send).toHaveBeenCalledWith("Data inserted successfully!");
});

test("returns error if the email already exists", async () => {
  db.checkDuplicateEmail.mockResolvedValue(true);

  await tableCreatorChecker(req, res);

  expect(res.status).toHaveBeenCalledWith(409);
  expect(res.send).toHaveBeenCalledWith(
    "Duplicate Email! The email already exists, try logging in"
  );
});

test("returns error if the password is not strong enough", async () => {
  req.body.password = "weak";

  await tableCreatorChecker(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith({ passValid: false });
});

/*
test("handles unexpected database errors during table creation", async () => {
  db.tableCreator.mockRejectedValue(new Error("Database failure"));

  await tableCreatorChecker(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.send).toHaveBeenCalledWith("Error processing your request");
});*/
