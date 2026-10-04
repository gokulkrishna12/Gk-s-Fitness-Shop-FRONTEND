import sharp from 'sharp'

// Use your ORIGINAL jpg/png here if you have it (better quality than re-encoding a webp)
const src = 'public/Home.webp'

await sharp(src).resize({ width: 800 }).webp({ quality: 70 })
    .toFile('public/Home-800.webp')

await sharp(src).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 72 })
    .toFile('public/Home-1600.webp')

console.log('done')