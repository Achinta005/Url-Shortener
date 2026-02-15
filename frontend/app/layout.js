import "./globals.css";
import { AuthProvider } from "./context/authContext";

export const metadata = {
  title: "Url Shortener",
  description: "Short  any long url into short UI friendly url",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
