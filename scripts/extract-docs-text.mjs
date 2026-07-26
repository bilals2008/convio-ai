import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pagesDir = join(__dirname, '..', 'apps', 'web', 'src', 'pages', 'docs')
const outDir = join(__dirname, '..', 'docs-text')

mkdirSync(outDir, { recursive: true })

const files = readdirSync(pagesDir).filter((f) => f.endsWith('.tsx'))

let allContent = '# Convio Documentation\n\n'

for (const file of files) {
  const src = readFileSync(join(pagesDir, file), 'utf-8')

  // Extract text between JSX tags — strip HTML-like tags, keep content
  const text = src
    // Remove TSX imports
    .replace(/^import .+$/gm, '')
    // Remove JSX tags
    .replace(/<[^>]+>/g, '')
    // Remove template literals and JS expressions
    .replace(/\{[^}]+\}/g, '')
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*[\r\n]/gm, '\n')
    .trim()

  const name = file.replace('.tsx', '')
  const header = name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const pageContent = text.slice(0, 3000) // limit per page

  // Write individual file
  writeFileSync(join(outDir, `${name}.txt`), pageContent, 'utf-8')

  // Also append to combined
  allContent += `\n\n## ${header}\n\n${pageContent}`
}

writeFileSync(join(outDir, '_all-docs.txt'), allContent, 'utf-8')

console.log(`✅ ${files.length} docs extracted → ${outDir}`)
console.log(`   Upload "${outDir}\\*.txt" files to your Knowledge Base`)
