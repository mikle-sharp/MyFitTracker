import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// Refresh access token if expired
async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
    };
  } catch {
    return null;
  }
}

// Create a new Google Sheet
async function createSheet(accessToken: string, title: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string } | null> {
  try {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: 'Тренировки',
              sheetType: 'GRID',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
          {
            properties: {
              title: 'Рекорды',
              sheetType: 'GRID',
            },
          },
        ],
      }),
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl,
    };
  } catch {
    return null;
  }
}

// Write data to sheet
async function writeToSheet(
  accessToken: string, 
  spreadsheetId: string, 
  range: string, 
  values: string[][]
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

// Clear and update entire sheet
async function updateSheet(
  accessToken: string, 
  spreadsheetId: string, 
  range: string, 
  values: string[][]
): Promise<boolean> {
  try {
    // Clear first
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    // Then update
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

// Read data from sheet
async function readFromSheet(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<string[][] | null> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.values || [];
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, accessToken, refreshToken, spreadsheetId, data } = body;

    let token = accessToken;

    // If we have refresh token, verify/refresh access token
    if (refreshToken) {
      // For simplicity, we'll just use the provided access token
      // In production, you'd check expiry and refresh if needed
      token = accessToken;
    }

    if (action === 'create') {
      const result = await createSheet(token, 'Мой журнал тренировок');
      
      if (!result) {
        return NextResponse.json({ error: 'Failed to create spreadsheet' }, { status: 500 });
      }

      // Add headers
      const headers = [['Дата', 'Тип', 'Упражнение', 'Подход', 'Повторения', 'Вес (кг)', 'Время (сек)']];
      await updateSheet(token, result.spreadsheetId, 'Тренировки!A1:G1', headers);

      const prHeaders = [['Упражнение', 'Повторения', 'Вес (кг)', 'Дата']];
      await updateSheet(token, result.spreadsheetId, 'Рекорды!A1:D1', prHeaders);

      return NextResponse.json(result);
    }

    if (action === 'sync') {
      if (!spreadsheetId) {
        return NextResponse.json({ error: 'No spreadsheet ID' }, { status: 400 });
      }

      // Clear and write workouts
      const workoutRows = data.workouts.map((w: { date: string; type: string; exercise: string; setNum: number; reps: number; weight: number; time?: number }) => [
        w.date,
        w.type,
        w.exercise,
        String(w.setNum),
        String(w.reps),
        String(w.weight),
        w.time ? String(w.time) : '',
      ]);
      
      const headers = [['Дата', 'Тип', 'Упражнение', 'Подход', 'Повторения', 'Вес (кг)', 'Время (сек)']];
      await updateSheet(token, spreadsheetId, 'Тренировки!A1', [...headers, ...workoutRows]);

      // Write PRs
      const prRows = data.records.map((r: { exercise: string; reps: number; weight: number; date: string }) => [
        r.exercise,
        String(r.reps),
        String(r.weight),
        r.date,
      ]);
      
      const prHeaders = [['Упражнение', 'Повторения', 'Вес (кг)', 'Дата']];
      await updateSheet(token, spreadsheetId, 'Рекорды!A1', [...prHeaders, ...prRows]);

      return NextResponse.json({ success: true, rowsWritten: workoutRows.length });
    }

    if (action === 'import') {
      if (!spreadsheetId) {
        return NextResponse.json({ error: 'No spreadsheet ID' }, { status: 400 });
      }

      const rows = await readFromSheet(token, spreadsheetId, 'Тренировки!A2:G');
      
      if (!rows) {
        return NextResponse.json({ error: 'Failed to read spreadsheet' }, { status: 500 });
      }

      return NextResponse.json({ data: rows });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Sheets API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
