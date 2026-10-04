import sharp from 'sharp'
import fs from 'fs'

const dir = 'src/assets'
const names = [
    'Gym-Equipments',
    'Whey-Protien',
    'Creatine',
    'Protien-bars',
    'Preworkout',
    'Essantial-Supplements',
]

for (const name of names) {
    const file = `${dir}/${name}.webp`
    const tmp = `${dir}/${name}.tmp.webp`
    const before = fs.statSync(file).size

    // 400px = 200px display at 2x sharpness
    await sharp(fs.readFileSync(file))
        .resize(400, 400, { fit: 'cover' })
        .webp({ quality: 72 })
        .toFile(tmp)

    fs.renameSync(tmp, file)
    console.log(name, Math.round(before / 1024) + ' KB ->', Math.round(fs.statSync(file).size / 1024) + ' KB')
}