import sharp from 'sharp'

const src = 'public/Home.webp' // use your ORIGINAL jpg/png here if you still have it

await sharp(src).resize({ width: 720 }).webp({ quality: 60, effort: 6 })
    .toFile('public/Home-800.webp')

await sharp(src).resize({ width: 1440, withoutEnlargement: true }).webp({ quality: 65, effort: 6 })
    .toFile('public/Home-1600.webp')

console.log('done')