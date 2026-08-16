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
<div style={{ fontSize: "48px", marginBottom: "16px" }}>⏸️</div>
<h1 style={{
color: "#1a1a1a",
fontSize: "24px",
fontWeight: "700",
marginBottom: "16px",
        }}>
          Service Temporarily Suspended
</h1>
<p style={{ color: "#555", lineHeight: "1.8", marginBottom: "12px" }}>
          This website has been taken offline due to an outstanding invoice for development services rendered.
</p>
<p style={{ color: "#555", lineHeight: "1.8", marginBottom: "24px" }}>
          Service will be restored once payment has been settled. Please contact the developer directly to resolve this.
</p>
<div style={{
borderTop: "1px solid #eee",
paddingTop: "20px",
color: "#aaa",
fontSize: "13px",
        }}>
          254 Convex Communication Ltd &mdash; Pending Payment Resolution
</div>
</div>
</div>
  )
}