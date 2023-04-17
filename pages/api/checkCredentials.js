// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// export default function handler(req, res) {
//   res.status(200).json({ name: 'John Doe' })
// }
export default async (req, res) => {
  const { username, password } = req.body;
  // console.log(username === process.env.USERNAME);
  // console.log(password === process.env.PASSWORD);
  let data = false;
  if (username === process.env.USERNAME && password === process.env.PASSWORD) {
    data = true;
  }
  res.status(200).json({ data });
};
