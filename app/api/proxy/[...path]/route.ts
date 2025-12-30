import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:5003/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxyRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxyRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxyRequest(request, params, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxyRequest(request, params, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxyRequest(request, params, 'DELETE');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function handleProxyRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    const url = new URL(request.url);
    const queryString = url.search;
    
    // Construct target URL
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const targetPath = pathString.startsWith('/') ? pathString : `/${pathString}`;
    const targetUrl = `${baseUrl}${targetPath}${queryString}`;
    
    console.log(`[Proxy] ${method} ${targetUrl}`);
    
    // Get authorization header from request
    const authHeader = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Copy other important headers
    const contentType = request.headers.get('content-type');
    if (contentType && !headers['Content-Type']) {
      headers['Content-Type'] = contentType;
    }
    
    // Get body for non-GET requests
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch {
        body = undefined;
      }
    }
    
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });
    
    const contentTypeHeader = response.headers.get('content-type');
    let data: any;
    
    if (contentTypeHeader?.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    } else {
      data = await response.text().catch(() => '');
    }
    
    console.log(`[Proxy] Response: ${response.status} for ${targetUrl}`);
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('[Proxy] Error:', error.message, error);
    return NextResponse.json(
      { 
        error: error.message || 'Proxy request failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

