import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WorkspaceService } from "@/application/services/WorkspaceService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // If the user isn't logged in, redirect them to login with a callback to this accept URL
      const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const { token } = await params;
      const callbackUrl = encodeURIComponent(`/api/invites/${token}/accept-email`);
      return NextResponse.redirect(`${appUrl}/login?callbackUrl=${callbackUrl}`);
    }

    const { token } = await params;

    const result = await WorkspaceService.acceptInvite(token, session.user.id);

    // After accepting, redirect them to the dashboard
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "Invalid invite";
    
    // Return a simple HTML error page so the user clearly sees what went wrong
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invitation Error</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f87171; color: white; text-align: center; }
            .container { max-width: 500px; padding: 2rem; background: rgba(0,0,0,0.2); border-radius: 1rem; }
            h1 { margin-top: 0; }
            a { color: white; font-weight: bold; text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Action Required</h1>
            <p>${errorMessage}</p>
            <br/>
            <p><a href="/dashboard">Return to Dashboard</a></p>
          </div>
        </body>
      </html>
      `,
      {
        status: 400,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
}
