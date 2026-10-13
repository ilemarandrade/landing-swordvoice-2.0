import { sendMailService } from "../../service/sendEmailService";

export async function POST(req: Request) {
  try {
    const { from, message, subject } = await req.json();
    await sendMailService({ from, text: message, subject });
    return Response.json({ message: true }, { status: 200 });
  } catch (err) {
    console.log(err, "error");
    return Response.json({ message: "fail" }, { status: 500 });
  }
}
