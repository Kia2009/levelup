import React from 'react';

export function renderMarkdown(text: string): JSX.Element {
  // Split text by math and code blocks
  const parts = text.split(/($$[^$]*$$|`[^`]*`)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        // Handle math blocks
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const mathContent = part.slice(2, -2);
          return (
            <span key={index} style={{ 
              backgroundColor: 'rgba(255, 193, 7, 0.1)', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontFamily: 'serif',
              color: '#856404',
              fontStyle: 'italic',
              border: '1px solid rgba(255, 193, 7, 0.3)'
            }}>
              {mathContent}
            </span>
          );
        }
        
        // Handle code blocks
        if (part.startsWith('`') && part.endsWith('`')) {
          const codeContent = part.slice(1, -1);
          return (
            <span key={index} style={{ position: 'relative', display: 'inline-block' }}>
              <code style={{
                backgroundColor: 'rgba(0,0,0,0.1)', 
                padding: '2px 24px 2px 4px', 
                borderRadius: '3px', 
                fontFamily: 'monospace', 
                color: '#e83e8c', 
                fontWeight: '500'
              }}>
                {codeContent}
              </code>
              <button
                className="code-copy-btn"
                onClick={() => navigator.clipboard.writeText(codeContent)}
                title="Copy code"
              >
                📋
              </button>
            </span>
          );
        }
        
        // Handle other formatting
        let formatted = part
          // Bold
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          // Italic
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          // Links - fix URL handling
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
            return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">${text}</a>`;
          });
        
        return <span key={index} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </>
  );
}