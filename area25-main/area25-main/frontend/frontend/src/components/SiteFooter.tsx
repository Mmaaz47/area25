import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer style={{ marginTop: 40, borderTop: '1px solid var(--border)', padding: '24px 16px', color: 'var(--muted-text)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <section>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>About</h4>
          <p style={{ margin: 0 }}>Furniture Store – curated pieces with timeless design.</p>
        </section>
        <section>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>Help</h4>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            <li><Link to="/contact">Contact</Link></li>
            <li><a href="#">Shipping & Returns</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms & Conditions</a></li>
          </ul>
        </section>
        <section>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>Connect</h4>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">Facebook</a></li>
          </ul>
        </section>
      </div>
      <div style={{ marginTop: 12, fontSize: 12 }}>© {new Date().getFullYear()} Furniture Store</div>
    </footer>
  )
}


