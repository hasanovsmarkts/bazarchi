import { NextResponse } from 'next/server'

export async function GET(request) {
  return NextResponse.json({ 
    message: 'Bazarchi API',
    status: 'active'
  })
}

export async function POST(request) {
  return NextResponse.json({ 
    message: 'POST request received',
    status: 'ok'
  })
}

