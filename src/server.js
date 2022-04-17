import "./db";
import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globaclRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const PORT = 4001;
const app = express();
app.set("views", process.cwd() + "/src/views"); //change default view directory
app.set("view engine", "pug"); //set view engine
app.use(morgan("dev")); //logger

app.use(express.urlencoded({ extended: true })); //express app can  understand form's value in js object style
app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🐾`);
app.listen(PORT, handleListening);
