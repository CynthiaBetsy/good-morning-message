import mongoose from "mongoose";

const thoughtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    thought: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("thought", thoughtSchema);
