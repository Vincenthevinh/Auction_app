import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import session from "express-session";
import passport from "./src/utils/passport.js";

const app = express();

app.engine("handlebars", engine({
    defaultLayout: "main",
    layoutsDir: "./src/views/layouts",
    partialsDir: "./src/views/partials"
}));

app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));

// Session + Passport
app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
import authRoutes from "./src/routes/auth.routes.js";
import homeRoutes from "./src/routes/home.routes.js";

app.use("/", homeRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server is running at http://localhost:${PORT}`));
