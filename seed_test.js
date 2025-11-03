import db from "./db/knex.js";
import bcrypt from "bcrypt";

async function run() {
  try {
    const pw = await bcrypt.hash("password", 10);
    const [id] = await db("users").insert({ email: "test@example.com", password_hash: pw, fullname: "Test User" }).returning("id");
    console.log("Inserted user id:", id);
    const users = await db("users").select("*");
    console.log("Users:", users);
  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}
run();
