// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// export default function handler(req, res) {
//   res.status(200).json({ name: 'John Doe' })
// }
import axios from "axios";

export default async (req, res) => {
  const { data } = req.body;
  try {
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to get distance", error: err });
  }
};
