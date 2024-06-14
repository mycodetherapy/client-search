import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { EventEmitter } from "events";
import { IUserData } from "./types";
import { userData } from "./base";

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

let abortEmitter: EventEmitter | null = null;

app.post("/api/search", async (req: Request, res: Response) => {
  if (abortEmitter) {
    abortEmitter.emit("abort");
  }

  const { email, number }: { email: string; number: string } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  abortEmitter = new EventEmitter();

  const timeoutId = setTimeout(() => {
    abortEmitter = null;
    const result: IUserData[] = userData.filter(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        (!number || user.number === number)
    );

    if (result.length === 0) {
      res.json({ message: "Nothing found" });
    } else {
      res.json(result);
    }
  }, 5000);

  abortEmitter.once("abort", () => {
    clearTimeout(timeoutId);
  });
});

app.listen(port, () => {
  console.log(`The server is running on port: ${port}`);
});
