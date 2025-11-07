import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.render("home/index", {
    title: "Home Page",
    layout: "main"
  });
});

router.get("/dashboard", (req, res) => {
  res.render("dashboard", {
    title: "Dashboard",
    layout: "main"
  });
});

export default router;
