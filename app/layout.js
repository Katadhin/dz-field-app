import "./globals.css";

export const metadata = {
  title: "d&z Field App",
  description: "Field visits for dz retail reps: talk a note, get structured data.",
};

export const viewport = {
  themeColor: "#37246B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
