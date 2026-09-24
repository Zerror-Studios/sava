import { sheets_v4 } from "@googleapis/sheets";
import { GoogleAuth } from "google-auth-library";
import { NextResponse } from "next/server";
import { isValidEmail } from "@/helper/validateEmail";

const spreadsheetId = "1OzzTKAUzE4a8wKsX2veHLo0tCMtc0ugwGXb-C9BEM5I";

function getAuth() {
  const clientEmail = "zerror-service-email@spartan-thunder-476511-r2.iam.gserviceaccount.com";
  const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCFq7veMKeJdcCn\nAbaXjT/Yn5JcOBTh4WR1bhCCUGaLOObem9kZ4AbCfeLRbow97WRNnGKwv+6Dm0xs\nmCZgJXpH6GAR1dkUYQfPLcXLnbWE7/bT5nHNlA/Zz2p9k6rcp2c8X9JgsSFyXsnd\nioBlNPA3vzQAjBtO5LFy7tKXk4Lyxwjh3MMtskHJBoiOMo8OJq6r2AnpDD3MBN/K\nJOhpcYD918FY15RJyOPWe6g4aZJqavOFE4U3bMIzDWiBgqsvuzZE9RTK9cWrS0pn\nI6P8HOqzV0wGhorTyiZBPOjcjCBT5hByT+wtBejD3x7IKM98ipIV7AKv0bN6MTHX\nFVsUiIt5AgMBAAECggEANLBHKqMh/rhX+lxeBSnLj08CyW/fp1OJHhKG1l7rtJf2\nxKtIrX7VG0e0ppm9FNHkdgUdD49v7BdETg/BHKfZJcvuRkl1OievBNaFfyeIe8B8\nmfTdScvBXbj4wEv7DuO7eRxKGAvp46OCTV2BE6OExmyLCmYvg274lRWXE+E0vg3t\nVaXmVhXjIQ8ykclEf1mT8rdbp2a7ZdaXChfq2eywADKXbsgzmzXhsfjScML6pVbt\nBzkoUyiewDOfkY3IE5jASwJWbt6l+EPzMRwrvJtJXDUFWqpQ+e0henPGJtL8EvX/\na5fWa8aCJVJ3eOAu0LHJIRmO9gVXzaZ75Opl9qf/0wKBgQC7Xjz8UV8fBV2isNX+\n/dAu0alxoywspEbMLc20ZsKvggyY3v2n7Rt7A5ENbTuQn5PB03Fb+WlLA16+9G8G\nSvAOosBspVXvRBFyKBVEOMy5qgfrD9SlantD7jQrl04KzlNJBcHbSnN9lPCHvPCQ\nfde1P6PRE6USQ56+pGl9NyUrCwKBgQC2ojqUvbDT5qxqKIpZXUsQtrTFwyD8BDrp\n/y7xwPlpXYXIKXcJmO4nBJwkpBIZ8yOOkaMd788w9LREyNNaCi5FT70E2looLm68\nGzVFt3sAyN8aVAuermoZDnMSlGg8vHWLshIuUlKecIPmqYzZzNmzoKCevjyn7BxH\nHUNK6K5WCwKBgAJmD3PPet9Dy1IU33h3OV4QExJAW4VqyPk+MN75Xc6vZIfkeuzW\nbT6i6g1484VDdbnKgi4CQGXUcjcRnAZBmVcmoD4D09jPT0Xd23/XFk/eLGHG/xrr\nBQ72krZoJnie8ZQCvduX1WirKnUiZxYCdmt8mBVKIhfcw8B/DFatCQ3HAoGBAJs6\noh4AaMaCvrLwSD8Si5XmJRod8vAhTE3NBoKWqabDxczOaY3vvSPOyERga75AqU0p\nPgJY7LrIklwQcYuLMa7ZymfQi2axqI8bdRkPjW2qTe6b1tCFoEoxvN7i4wIUkLgu\nn0Nd1zkxmvq3y67nbXY+paanPPjhN1u+ZI7L3DnnAoGAH1ZGXtmPWHKpsIgLIWpu\nVL0aJ3N2KxbV4kQ0sYoBThSxS1mrd93jIksk5xA3E2h+XdEjcsNHnlxwFjG+snIt\n4p4Gj2J6miAkoaXxAgCCW7s/8FD47bG6dKMIRX2vBUJqcWRG37Lql+KlFjIR8y8Y\nRd6D7dBgoifWynOd/eQpoLE=\n-----END PRIVATE KEY-----\n";

  if (!clientEmail || !privateKey) return null;

  return new GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String((body as { email?: string })?.email ?? "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email" },
        { status: 400 },
      );
    }

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID missing" },
        { status: 500 },
      );
    }

    const auth = getAuth();
    if (!auth) {
      return NextResponse.json(
        { error: "Google credentials missing" },
        { status: 500 },
      );
    }

    const sheets = new sheets_v4.Sheets({ auth });

    const kolkataTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const [datePart] = kolkataTime.split(",");
    const formattedDate = datePart.trim();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A:E",
    });

    const rows = response.data.values || [];
    const emailRow = rows.find((row) => row?.[1]?.toLowerCase() === email);

    if (emailRow) {
      const rowIndex = rows.indexOf(emailRow) + 1;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A${rowIndex}:B${rowIndex}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[formattedDate, email]],
        },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A:B",
        valueInputOption: "RAW",
        requestBody: {
          values: [[formattedDate, email]],
        },
      });
    }

    return NextResponse.json({ message: "Subscribed" }, { status: 200 });
  } catch (error) {
    console.error("Waitlist subscription error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
