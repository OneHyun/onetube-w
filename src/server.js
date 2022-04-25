import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const app = express();
app.set("views", process.cwd() + "/src/views"); //change default view directory
app.set("view engine", "pug"); //set view engine
app.use(morgan("dev")); //logger

app.use(express.urlencoded({ extended: true })); //express app can  understand form's value in js object style
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
