import { ThemeToggle } from '../theme-toggle'
import { ThemeProvider } from '../theme-provider'

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="flex items-center gap-4 p-4">
        <span>Theme Toggle:</span>
        <ThemeToggle />
      </div>
    </ThemeProvider>
  )
}