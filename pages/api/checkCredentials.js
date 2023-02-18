// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// export default function handler(req, res) {
//   res.status(200).json({ name: 'John Doe' })
// }
export default async (req, res) => {
  const { username, password } = req.body;
  console.log(username === process.env.USERNAME);
  console.log(password === process.env.PASSWORD);
  try {
    if (
      username !== process.env.USERNAME &&
      password !== process.env.PASSWORD
    ) {
      throw new Error("nok");
    }
    res.status(200).json({ data: true });
  } catch (err) {
    res.status(500).json({ data: false });
  }
};
