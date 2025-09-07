import express from "express";
import { handler } from "./handler";

export const app = express();

app.use(express.json());
app.use("/auth", handler);

app.get("/health", (req, res) => {
  res.send("Auth Service Running!");
});
