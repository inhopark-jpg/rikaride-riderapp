import type { Preview } from '@storybook/react'
import '../src/index.css'

const preview: Preview = {
  // Every story gets a generated docs page.
  tags: ['autodocs'],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
