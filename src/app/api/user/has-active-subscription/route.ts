import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasActiveSubscription } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ hasActiveSubscription: false });
    }

    const hasSubscription = await hasActiveSubscription(session.user.id);
    
    return NextResponse.json({ hasActiveSubscription: hasSubscription });
  } catch (error) {
    console.error('Error checking active subscription:', error);
    return NextResponse.json(
      { error: 'An error occurred while checking subscription' },
      { status: 500 }
    );
  }
}
