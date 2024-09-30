import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";


if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = "your-database-name";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await client.connect();
  const db = client.db(dbName);
  const { method } = req;

  if (method === "GET") {
    const userId = req.query.userId;
    if (typeof userId !== 'string') {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }
    const records = await db.collection("records").find({ userId }).toArray();
    res.status(200).json(records);
  } else if (method === "POST") {
    const newRecord = req.body;
    await db.collection("records").insertOne(newRecord);
    res.status(201).json(newRecord);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};
