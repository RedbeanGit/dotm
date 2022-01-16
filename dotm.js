const { MongoClient } = require('mongodb')
const dotenv = require('dotenv')
const utils = require('./utils')
const { runSet, runGet, runGetHash, runReport } = require('./commands')

dotenv.config()

const user = process.env.DOTM_USER
const password = process.env.DOTM_PASSWORD
const host = process.env.DOTM_HOST
const port = process.env.DOTM_PORT
const url = `mongodb://${user}:${encodeURIComponent(password)}@${host}:${port}`
const client = new MongoClient(url)

async function main() {
    console.log('Connecting to mongodb...')
    await client.connect()
    console.log('Connected')

    const collection = client.db(process.env.DOTM_DB).collection('entries')
    const args = process.argv

    if (args.length >= 3) {
        if (args[2] == 'GET') {
            await runGet(collection, args.slice(3).join(' '))
        } else if (args[2] == 'GET-HASH') {
            await runGetHash(collection, args.slice(3).join(' '))
        } else if (args[2] == 'REPORT') {
            if (args.length >= 4 && args[3] == 'PERDAY') {
                await runReport(collection, args.slice(4).join(' '))
            } else {
                console.error('Unknown report type. Try node dotm.js REPORT PERDAY [project]')
            }
        } else {
            await runSet(collection, args.slice(2).join(' '))
        }
    } else {
        console.error('Missing arguments. Try "node dotm.js December 12 2h mongodb This is a test"')
    }

    return 'Done'
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close())