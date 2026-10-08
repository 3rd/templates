import { createAppWindow } from './app-window.ts'
import { countCharacters } from './characters.ts'

const window = createAppWindow({ count_characters: countCharacters })

await window.run()
