import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { MongoRepository } from "@/infrastructure/repositories/MongoRepository";

export interface FormPresetDoc {
  _id?: string;
  id?: string;
  userId?: string;
  name: string;
  category: string;
  description?: string;
  isCustom: boolean;
  fields: any[];
  branding?: any;
  createdAt: Date | string;
}

class FormPresetRepositoryImpl extends MongoRepository<FormPresetDoc> {
  constructor() {
    super("registration_presets");
  }
}

const formPresetRepo = new FormPresetRepositoryImpl();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const presets = await formPresetRepo.findAll();
    return NextResponse.json(successResponse(presets));
  } catch (error: any) {
    return NextResponse.json(errorResponse(error.message || "Failed to fetch form presets"), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(errorResponse("Preset name is required"), { status: 400 });
    }

    const presetDoc: FormPresetDoc = {
      userId: session?.user?.id || "anonymous",
      name: body.name,
      category: body.category || "Custom",
      description: body.description || "",
      isCustom: true,
      fields: body.fields || [],
      branding: body.branding || {},
      createdAt: new Date()
    };

    const created = await formPresetRepo.create(presetDoc);
    return NextResponse.json(successResponse(created, "Preset saved globally across all events"), { status: 201 });
  } catch (error: any) {
    return NextResponse.json(errorResponse(error.message || "Failed to save form preset"), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const presetId = searchParams.get("id");
    if (!presetId) {
      return NextResponse.json(errorResponse("Preset ID is required"), { status: 400 });
    }

    await formPresetRepo.delete(presetId);
    return NextResponse.json(successResponse(null, "Preset deleted globally"));
  } catch (error: any) {
    return NextResponse.json(errorResponse(error.message || "Failed to delete preset"), { status: 500 });
  }
}
