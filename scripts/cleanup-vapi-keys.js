#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Patterns to search for
const patterns = [
  /NEXT_PUBLIC_VAPI_API_KEY/g,
  /process\.env\.NEXT_PUBLIC_VAPI_API_KEY/g,
  /vapi.*client.*side/gi,
  /new\s+VAPIClient/g,
]

// File extensions to check
const extensions = [".ts", ".tsx", ".js", ".jsx", ".json", ".md"]

// Directories to ignore
const ignoreDirs = ["node_modules", ".next", ".git", "dist", "build"]

function shouldIgnoreFile(filePath) {
  return ignoreDirs.some((dir) => filePath.includes(dir))
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    const issues = []

    patterns.forEach((pattern, index) => {
      const matches = content.match(pattern)
      if (matches) {
        matches.forEach((match) => {
          const lines = content.split("\n")
          lines.forEach((line, lineNumber) => {
            if (line.includes(match)) {
              issues.push({
                pattern: pattern.source,
                match,
                line: lineNumber + 1,
                content: line.trim(),
              })
            }
          })
        })
      }
    })

    return issues
  } catch (error) {
    log("red", `Error reading file ${filePath}: ${error.message}`)
    return []
  }
}

function scanDirectory(dirPath) {
  const results = []

  try {
    const items = fs.readdirSync(dirPath)

    items.forEach((item) => {
      const itemPath = path.join(dirPath, item)

      if (shouldIgnoreFile(itemPath)) {
        return
      }

      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        results.push(...scanDirectory(itemPath))
      } else if (stat.isFile()) {
        const ext = path.extname(itemPath)
        if (extensions.includes(ext)) {
          const issues = scanFile(itemPath)
          if (issues.length > 0) {
            results.push({
              file: itemPath,
              issues,
            })
          }
        }
      }
    })
  } catch (error) {
    log("red", `Error scanning directory ${dirPath}: ${error.message}`)
  }

  return results
}

function main() {
  log('blue', '🔍 Scanning for client-side VAPI API key usage...\n')

  const projectRoot = process.cwd()
  const results = scanDirectory(projectRoot)

  if (results.length === 0) {
    log('green', '✅ No client-side VAPI API key references found!')
    log('green', '✅ Your application is secure - all VAPI operations are server-side only.')
    return
  }

  log('yellow', `⚠️  Found ${results.length} files with potential security issues:\n\
