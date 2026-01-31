import { NextResponse } from 'next/server'
import { getInventorySummary } from '@/lib/services/inventory.service'

export async function GET() {
  try {
    const summary = await getInventorySummary()
    return NextResponse.json(summary)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
