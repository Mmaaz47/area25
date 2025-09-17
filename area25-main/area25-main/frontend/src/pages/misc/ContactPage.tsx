export function ContactPage() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Contact</h2>
      <p>We'd love to hear from you. Reach out via the form below.</p>
      <form style={{ display: 'grid', gap: 12, maxWidth: 520 }} onSubmit={e => e.preventDefault()}>
        <input placeholder="Your name" required />
        <input placeholder="Email" type="email" required />
        <textarea placeholder="Message" rows={5} required />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}


