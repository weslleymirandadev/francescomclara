import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { hasActiveSubscription: false, error: "Authentication required" }, 
        { status: 401 }
      );
    }

    const hasSubscription = await hasActiveSubscription(session.user.id);

    return NextResponse.json(
      { hasActiveSubscription: hasSubscription },
      { 
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" } 
      }
    );
  } catch (error) {
    console.error('Error checking active subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}