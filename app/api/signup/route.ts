import { NextResponse } from 'next/server';
import { createUser, getUser } from '@/lib/dbOperations';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await getUser(username);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await createUser({ username, password: hashedPassword });

    // Generate JWT token
    const token = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET || '123',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        username
      }
    });
  } catch (error: any) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    );
  }
}

