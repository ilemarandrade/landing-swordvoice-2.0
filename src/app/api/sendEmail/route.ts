import type { NextApiRequest, NextApiResponse } from "next";
import { sendMailService } from "../../service/sendEmailService";

export async function POST(req: Request, res: NextApiResponse) {
  try {
    const { from, message, subject } = await req.json();
    const result = await sendMailService({ from, text: message, subject });
    return Response.json({ message: true }, { status: 200 });
  } catch (err) {
    console.log(err, "error");
    res.status(500).json({ message: "fail" });
  }
}
