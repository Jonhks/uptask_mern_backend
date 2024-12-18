import mongoose, { Schema, Document, Types } from "mongoose";
import User from "./User";

export interface IToken extends Document {
  token: string;
  user: Types.ObjectId;
  createAt: Date;
}

const tokenSchema: Schema = new Schema({
  token: {
    type: String,
    require: true,
  },
  user: {
    type: String,
    require: true,
    ref: User,
  },
  createAt: {
    type: Date,
    default: Date.now(),
    expires: "10m",
  },
});

const Token = mongoose.model<IToken>("token", tokenSchema);
export default Token;
