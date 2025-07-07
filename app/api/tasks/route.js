import "@/app/lib/mongoose";
import Task from "@/app/lib/models/Task";

export async function GET() {
  const tasks = await Task.find().sort({ createdAt: -1 });
  return Response.json(tasks);
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title || body.title.trim().length < 2) {
      return Response.json(
        { error: "Title is required and must be at least 2 characters." },
        { status: 400 }
      );
    }
    const task = await Task.create({
      title: body.title.trim(),
      description: body.description?.trim() || "",
    });
    return Response.json(task, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
