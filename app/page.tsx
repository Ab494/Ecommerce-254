export default function HomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f4f4f4",
      fontFamily: "sans-serif",
      padding: "20px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        padding: "48px 40px",
        maxWidth: "520px",
        width: "100%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔧</div>
        <h1 style={{
          color: "#1a1a1a",
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "16px",
        }}>
          Website Under Maintenance
        </h1>
        <p style={{ color: "#555", lineHeight: "1.8", marginBottom: "12px" }}>
          We are currently performing scheduled maintenance and updates on this website.
        </p>
        <p style={{ color: "#555", lineHeight: "1.8", marginBottom: "24px" }}>
          We apologize for the inconvenience. Please check back soon.
        </p>
        <div style={{
          borderTop: "1px solid #eee",
          paddingTop: "20px",
          color: "#aaa",
          fontSize: "13px",
        }}>
          254 Convex Communication Ltd &mdash; Coming Back Soon
        </div>
      </div>
    </div>
  )
}