export function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        >
          <div
            style={{
              height: 200,
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }}
          />
          <div style={{ padding: 16 }}>
            <div
              style={{
                height: 20,
                background: '#f0f0f0',
                borderRadius: 4,
                marginBottom: 8,
                width: '70%'
              }}
            />
            <div
              style={{
                height: 16,
                background: '#f0f0f0',
                borderRadius: 4,
                width: '40%'
              }}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </>
  )
}