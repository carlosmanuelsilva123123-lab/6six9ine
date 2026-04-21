import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import axios from "axios";
import { ethers } from "ethers";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔒 Rate limit
app.use(rateLimit({ windowMs: 60000, max: 20 }));

// 🧠 MongoDB
mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model("User", {
  address: String,
  points: { type: Number, default: 0 },
  lastMine: { type: Number, default: 0 },
  claimedToday: { type: Number, default: 0 },
  lastClaimDate: { type: String, default: "" },
  isVerified: { type: Boolean, default: false }
});

// 🔗 Blockchain
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const token = new ethers.Contract(
  process.env.TOKEN_ADDRESS,
  ["function transfer(address to, uint amount) returns (bool)"],
  wallet
);

// 🔐 VERIFY WORLD ID
app.post("/verify", async (req, res) => {
  const { address, proof } = req.body;

  try {
    const r = await axios.post(
      "https://developer.worldcoin.org/api/v1/verify",
      {
        proof,
        signal: address,
        action: "mining_app"
      }
    );

    if (!r.data.success) return res.status(400).json({ error: "No válido" });

    let user = await User.findOne({ address });
    if (!user) user = await User.create({ address });

    user.isVerified = true;
    await user.save();

    res.json({ success: true });

  } catch {
    res.status(500).json({ error: "Error verify" });
  }
});

// ⛏️ MINE
app.post("/mine", async (req, res) => {
  const { address } = req.body;

  const user = await User.findOne({ address });

  if (!user || !user.isVerified)
    return res.status(403).json({ error: "No verificado" });

  const now = Date.now();

  if (now - user.lastMine < 10000)
    return res.status(400).json({ error: "Cooldown" });

  user.points += 10;
  user.lastMine = now;

  await user.save();

  res.json({ points: user.points });
});

// 💸 CLAIM
app.post("/claim", async (req, res) => {
  const { address } = req.body;

  const user = await User.findOne({ address });

  if (!user || user.points < 100)
    return res.status(400).json({ error: "Sin puntos" });

  const today = new Date().toDateString();

  if (user.lastClaimDate !== today) {
    user.claimedToday = 0;
    user.lastClaimDate = today;
  }

  if (user.claimedToday >= 3)
    return res.status(400).json({ error: "Límite diario" });

  try {
    const amount = ethers.parseUnits("1", 18);

    const tx = await token.transfer(address, amount);
    await tx.wait();

    user.points -= 100;
    user.claimedToday += 1;

    await user.save();

    res.json({ success: true, tx: tx.hash });

  } catch {
    res.status(500).json({ error: "Error TX" });
  }
});

app.listen(process.env.PORT || 3001, () =>
  console.log("🚀 RUNNING")
);
