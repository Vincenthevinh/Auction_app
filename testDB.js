import db from "./db/knex.js";

async function test() {
  try {
    const r = await db.raw("SELECT NOW()");
    console.log("DB Time:", r.rows ? r.rows[0].now : r[0]);
  } catch (err) {
    console.error("DB connect error:", err.message);
  } finally {
    await db.destroy();
  }
}
test();
