import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    claimAmount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    documentUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    submissionDate: { type: Date, default: Date.now },
    approvedAmount: { type: Number, default: null, min: 0 },
    insurerComments: { type: String, default: null, trim: true },
  },
  { timestamps: true, versionKey: false },
);

claimSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Claim = mongoose.model('Claim', claimSchema);
