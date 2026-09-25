export function GET() {
  return Response.json({
    name: "Duo Snap",
    short_name: "DuoSnap",
    description: "Private couple snaps, inspired by Locket.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f2",
    theme_color: "#fff8f2",
    icons: [{ src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
  });
}
