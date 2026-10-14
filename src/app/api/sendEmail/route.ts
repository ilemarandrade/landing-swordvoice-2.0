import { contactSchema, deliverContactEmail } from "@/features/home/server";

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Datos inválidos" }, { status: 400 });
  }

  try {
    await deliverContactEmail(parsed.data);
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("sendEmail failed", error);
    return Response.json(
      { message: "No se pudo enviar el mensaje" },
      { status: 500 },
    );
  }
}
