// migrations/xxxx_create_otps.js
export async function up(knex) {
  await knex.schema.createTable('otps', t => {
    t.increments('id').primary();
    t.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    t.string('otp_code', 6).notNullable();
    t.timestamp('expires_at').notNullable();
    t.boolean('used').defaultTo(false);
    t.timestamps(true, true);
  });
}
export async function down(knex) {
  await knex.schema.dropTableIfExists('otps');
}
