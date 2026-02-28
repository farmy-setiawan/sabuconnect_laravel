import { NextResponse } from 'next/server'
import { register } from '@/lib/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, phone, role = 'USER' } = body

    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    const response = await register({
      email,
      password,
      name,
      phone,
      role: role === 'PROVIDER' ? 'PROVIDER' : 'USER',
    })

    return NextResponse.json(
      {
        message: 'Registrasi berhasil',
        user: response.user,
        token: response.token,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}
