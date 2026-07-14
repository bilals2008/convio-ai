interface FileIconProps {
  type: string
  size?: number
  className?: string
}

const EXTENSIONS: Record<string, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: '#E53E3E' },
  doc: { label: 'DOC', color: '#2B6CB0' },
  docx: { label: 'DOCX', color: '#2B6CB0' },
  xls: { label: 'XLS', color: '#38A169' },
  xlsx: { label: 'XLSX', color: '#38A169' },
  csv: { label: 'CSV', color: '#38A169' },
  txt: { label: 'TXT', color: '#718096' },
  json: { label: 'JSON', color: '#D69E2E' },
  xml: { label: 'XML', color: '#D69E2E' },
  html: { label: 'HTML', color: '#DD6B20' },
  css: { label: 'CSS', color: '#3182CE' },
  js: { label: 'JS', color: '#D69E2E' },
  ts: { label: 'TS', color: '#3182CE' },
  jsx: { label: 'JSX', color: '#3182CE' },
  tsx: { label: 'TSX', color: '#3182CE' },
  java: { label: 'JAVA', color: '#C53030' },
  py: { label: 'PY', color: '#2B6CB0' },
  sql: { label: 'SQL', color: '#DD6B20' },
  png: { label: 'PNG', color: '#38A169' },
  jpg: { label: 'JPG', color: '#D69E2E' },
  jpeg: { label: 'JPEG', color: '#D69E2E' },
  gif: { label: 'GIF', color: '#E53E3E' },
  svg: { label: 'SVG', color: '#DD6B20' },
  webp: { label: 'WEBP', color: '#38A169' },
  mp3: { label: 'MP3', color: '#805AD5' },
  wav: { label: 'WAV', color: '#805AD5' },
  mp4: { label: 'MP4', color: '#805AD5' },
  avi: { label: 'AVI', color: '#805AD5' },
  mkv: { label: 'MKV', color: '#805AD5' },
  zip: { label: 'ZIP', color: '#718096' },
  rar: { label: 'RAR', color: '#718096' },
  fig: { label: 'FIG', color: '#D53F8C' },
  psd: { label: 'PSD', color: '#3182CE' },
  ai: { label: 'AI', color: '#DD6B20' },
  exe: { label: 'EXE', color: '#718096' },
  dmg: { label: 'DMG', color: '#718096' },
}

const CATEGORIES: Record<string, { label: string; color: string }> = {
  document: { label: 'DOC', color: '#2B6CB0' },
  image: { label: 'IMG', color: '#38A169' },
  video: { label: 'VID', color: '#805AD5' },
  audio: { label: 'AUD', color: '#805AD5' },
  code: { label: 'CODE', color: '#D69E2E' },
  web: { label: 'WEB', color: '#DD6B20' },
  integration: { label: 'API', color: '#3182CE' },
  structured: { label: 'DATA', color: '#38A169' },
  folder: { label: 'FOLDER', color: '#D69E2E' },
  spreadsheet: { label: 'SHEET', color: '#38A169' },
}

export function FileIcon({ type, size = 20, className }: FileIconProps) {
  const ext = type.toLowerCase().replace(/^\./, '')
  const meta = EXTENSIONS[ext] ?? CATEGORIES[ext] ?? { label: ext.toUpperCase().slice(0, 6), color: '#718096' }

  const w = size
  const h = size * 1.2

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M20 27H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3h10.343a3 3 0 0 1 2.121.879l5.657 5.657A3 3 0 0 1 23 9.657V24a3 3 0 0 1-3 3Z"
        fill="#F7FAFC"
        stroke="#E2E8F0"
        strokeWidth="1.5"
      />
      <path
        d="M14 1v5a3 3 0 0 0 3 3h5"
        fill="#EDF2F7"
        stroke="#E2E8F0"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {meta.label.length <= 4 ? (
        <text
          x="12"
          y="19"
          textAnchor="middle"
          fill={meta.color}
          fontSize={meta.label.length > 3 ? 6 : 7}
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          letterSpacing="0.02em"
        >
          {meta.label}
        </text>
      ) : (
        <text
          x="12"
          y="19"
          textAnchor="middle"
          fill={meta.color}
          fontSize="5.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          letterSpacing="0.02em"
        >
          {meta.label}
        </text>
      )}
    </svg>
  )
}
