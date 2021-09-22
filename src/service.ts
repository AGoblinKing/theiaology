import { CACHE } from './config'

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll([
        '/index.html',
        '/global.css',
        '/favicon.png',
        '/font/MajorMonoDisplay-Regular.ttf',
        '/build/cardinal.js',
        '/build/physics.js',
        '/build/bundle.css',
        '/build/main.js',
      ])
    })
  )
})

self.addEventListener('fetch', (e: any) => {
  const { request } = e
  e.respondWith(
    fetch(request)
      .then((response) => {
        if (request.method !== 'GET' || !/^http/.test(request.scheme))
          return response

        const copy = response.clone()
        caches.open(CACHE).then((cache) => {
          cache.put(request, copy)
        })
        return response
      })
      .catch((e) => {
        console.error(e)
        return caches.match(request).then((resp) => {
          return resp || caches.match('/index.html')
        })
      })
  )
})

export {}
