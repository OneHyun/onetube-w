import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globaclRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const PORT = 4001;

const app = express();
app.use(morgan("dev")); //logger

app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

const handleListening = () => console.log(`Server listening on port http://localhost:${PORT} 🐱‍🏍`);
app.listen(PORT, handleListening);