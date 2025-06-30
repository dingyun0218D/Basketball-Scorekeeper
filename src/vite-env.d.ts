/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase 环境变量
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string
  
  // LeanCloud 环境变量
  readonly VITE_LEANCLOUD_APP_ID: string
  readonly VITE_LEANCLOUD_APP_KEY: string
  readonly VITE_LEANCLOUD_SERVER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 