export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  modules: ['@pinia/nuxt'],
  devtools: { enabled: true },
  css: ['@/assets/styles/tokens.scss', '@/assets/styles/main.scss'],
  typescript: { strict: true, typeCheck: true },
})
