export async function up(knex) {
  await knex.schema.createTable("users", (t) => {
    t.increments("id").primary();
    t.string("email").notNullable().unique();
    t.string("password_hash").notNullable();
    t.string("fullname");
    t.string("role").notNullable().defaultTo("bidder");
    t.timestamps(true, true);
  });

  await knex.schema.createTable("categories", (t) => {
    t.increments("id").primary();
    t.string("name").notNullable();
    t.integer("parent_id").unsigned().references("id").inTable("categories");
  });

  await knex.schema.createTable("products", (t) => {
    t.increments("id").primary();
    t.string("title").notNullable();
    t.text("description");
    t.integer("seller_id").unsigned().references("id").inTable("users").onDelete("SET NULL");
    t.integer("category_id").unsigned().references("id").inTable("categories").onDelete("SET NULL");
    t.integer("start_price").notNullable().defaultTo(0);
    t.integer("step_price").notNullable().defaultTo(10000);
    t.integer("buy_now_price");
    t.timestamp("start_at").defaultTo(knex.fn.now());
    t.timestamp("end_at").notNullable();
    t.integer("current_price");
    t.integer("current_bidder_id").unsigned().references("id").inTable("users").onDelete("SET NULL");
    t.boolean("auto_extend").defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable("product_images", (t) => {
    t.increments("id").primary();
    t.integer("product_id").unsigned().references("id").inTable("products").onDelete("CASCADE");
    t.string("url");
    t.boolean("is_main").defaultTo(false);
  });

  await knex.schema.createTable("bids", (t) => {
    t.increments("id").primary();
    t.integer("product_id").unsigned().references("id").inTable("products").onDelete("CASCADE");
    t.integer("user_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
    t.integer("amount").notNullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("watchlists", (t) => {
    t.increments("id").primary();
    t.integer("user_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
    t.integer("product_id").unsigned().references("id").inTable("products").onDelete("CASCADE");
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("questions", (t) => {
    t.increments("id").primary();
    t.integer("product_id").unsigned().references("id").inTable("products").onDelete("CASCADE");
    t.integer("user_id").unsigned().references("id").inTable("users").onDelete("SET NULL");
    t.text("question");
    t.text("answer");
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("reviews", (t) => {
    t.increments("id").primary();
    t.integer("from_user").unsigned().references("id").inTable("users").onDelete("CASCADE");
    t.integer("to_user").unsigned().references("id").inTable("users").onDelete("CASCADE");
    t.integer("score").notNullable();
    t.text("comment");
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("reviews");
  await knex.schema.dropTableIfExists("questions");
  await knex.schema.dropTableIfExists("watchlists");
  await knex.schema.dropTableIfExists("bids");
  await knex.schema.dropTableIfExists("product_images");
  await knex.schema.dropTableIfExists("products");
  await knex.schema.dropTableIfExists("categories");
  await knex.schema.dropTableIfExists("users");
}
