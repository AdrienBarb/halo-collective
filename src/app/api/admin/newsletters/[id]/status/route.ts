import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/better-auth/adminGuard";
import { errorHandler } from "@/lib/errors/errorHandler";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors/AppError";

const newsletterIdSchema = z
  .string()
  .regex(/^[a-z0-9]{20,32}$/, "Invalid newsletter id");

type Context = { params: Promise<{ id: string }> };

// Lightweight polling endpoint for the admin UI. PublishToggle hits
// this on a 5s interval while the row is SENDING so it can flip to
// "Published" once `after()` (or a retry) finishes the Brevo work.
export async function GET(req: NextRequest, ctx: Context) {
  try {
    const { response } = await adminGuard();
    if (response) return response;

    const id = newsletterIdSchema.parse((await ctx.params).id);

    const row = await prisma.newsletter.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        publishedAt: true,
        brevoSentAt: true,
      },
    });
    if (!row) throw new NotFoundError("Newsletter not found");

    return NextResponse.json(row);
  } catch (error) {
    return errorHandler(error);
  }
}
