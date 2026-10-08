import type { ElectrobunConfig } from 'electrobun'

export default {
  app: {
    name: 'ts-gui-electrobun',
    identifier: 'dev.example.ts-gui-electrobun',
    version: '0.0.0'
  },
  build: {
    views: {
      mainview: {
        entrypoint: 'src/mainview/index.ts'
      }
    },
    copy: {
      'src/mainview/index.html': 'views/mainview/index.html'
    },
    linux: {
      bundleCEF: false
    },
    mac: {
      bundleCEF: false,
      createDmg: false
    },
    win: {
      bundleCEF: false
    }
  }
} satisfies ElectrobunConfig
