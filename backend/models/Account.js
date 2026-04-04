import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    interestLevel: {
      type: String,
      enum: ["beginner", "intermediate", "expert"],
      required: true,
    },
    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    roles: {
      type: [String],
      default: ["user"],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure indexes are created when the model is initialized.
accountSchema.index({ username: 1 }, { unique: true });

const Account = mongoose.model("Account", accountSchema);

export default Account;
