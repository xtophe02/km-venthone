// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// export default function handler(req, res) {
//   res.status(200).json({ name: 'John Doe' })
// }
import axios from "axios";

export default async (req, res) => {
  const { from, to } = req.body;

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${from}&destinations=${to}&key=${process.env.GOOGLE_API_KEY}`
    );
    const distance = response.data.rows[0].elements[0].distance.value;
    res.status(200).json({ distance });
  } catch (err) {
    res.status(500).json({ message: "Failed to get distance", error: err });
  }
};
