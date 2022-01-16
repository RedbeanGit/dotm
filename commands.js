const utils = require('./utils')

class Entry {
    constructor(projectName, date, duration, description) {
        this.project = projectName
        this.date = {
            year: date.getFullYear(),
            month: date.getUTCMonth(),
            day: date.getUTCDate()
        }
        this.duration = duration.getUTCHours() * 60 + duration.getUTCMinutes()
        this.description = description
        this.tags = utils.findTags(description)
    }
}

module.exports = {
    runSet: async function(collection, args) {
        const timeArg = utils.findTimeArg(args)
    
        if (!timeArg) {
            console.error('No time argument found')
            return false
        }
    
        const rawDate = utils.findDate(timeArg)
        const rawDuration = utils.findDuration(timeArg.replace(rawDate, '').trim())
    
        if (!rawDate) {
            console.error('No date found in time argument')
            return false
        }
    
        if (!rawDuration) {
            console.error('No duration found in time argument')
            return false
        }
    
        const notTimeArg = args.replace(timeArg, '').trim().split(' ')
    
        const date = utils.parseDate(rawDate)
        const duration = utils.parseDuration(rawDuration)
        const project = notTimeArg[0]
        const description = notTimeArg.slice(1).join(' ')
    
        const entry = new Entry(project, date, duration, description)
    
        await collection.insertOne(entry)
        console.log('Entry added to mongodb')
    
        return true
    },
    runGet: async function(collection, args) {
        const rawDate = utils.findDate(args)
    
        if (!rawDate) {
            console.error('No date found')
            return false
        }
    
        const date = utils.parseDate(rawDate)
        const project = args.replace(rawDate, '').trim().split(' ')[0]
        const matchQuery = {
            date: {
                year: date.getFullYear(),
                month: date.getUTCMonth(),
                day: date.getUTCDate()
            }
        }
        const groupQuery = {
            _id: {
                project: '$project'
            },
            totalDuration: {
                $sum: "$duration"
            }
        }
        const query = [
            { $match: matchQuery },
            { $group: groupQuery }
        ]
    
        if (project.length) {
            query[0].$match.project = project
            const results = await collection.aggregate(query).toArray()
    
            if (!results.length) {
                console.error('No entry found')
                return false
            }

            for (let result of results) {
                console.log(`Project: ${project}, totalDuration: ${utils.formatDuration(result.totalDuration)}`)
            }
        } else {
            const results = await collection.aggregate(query).toArray()
    
            if (!results.length) {
                console.error('No entry found')
                return false
            }

            for (let result of results) {
                console.log(`Project: ${result._id.project}, totalDuration: ${utils.formatDuration(result.totalDuration)}`)
            }
        }
        return true
    },
    runGetHash: async function runGetHash(collection, args) {
        args = args.split(' ').filter(word => word.length)
    
        const matchQuery = {}
        const groupQuery = {
            _id: {},
            totalDuration: {
                $sum: "$duration"
            }
        }
        const query = [
            { $match: matchQuery },
            { $group: groupQuery }
        ]
    
        if (args.length >= 2) {
            const hashtag = args[0].toLowerCase()
            const project = args[1]
            query[0].$match.tags = hashtag
            query[0].$match.project = project
            query[1].$group._id.project = project
    
            const results = await collection.aggregate(query).toArray()
    
            if (!results.length) {
                console.error('No entry found')
                return false
            }

            for (let result of results) {
                console.log(`Project: ${project}, Hashtag: #${hashtag}, totalDuration: ${utils.formatDuration(result.totalDuration)}`)
            }
        } else if (args.length == 1) {
            const hashtag = args[0].toLowerCase()
            query[0].$match.tags = hashtag
            const results = await collection.aggregate(query).toArray()

            if (!results.length) {
                console.error('No entry found')
                return false
            }
    
            for (let result of results) {
                console.log(`Hashtag: #${hashtag}, totalDuration: ${utils.formatDuration(result.totalDuration)}`)
            }
        } else {
            console.error('No hashtag found')
            return false
        }
        return true
    },
    runReport: async function(collection, args) {
        const project = args.split(' ')[0]
        const matchQuery = {}
        const groupQuery = {
            _id: {
                date: "$date"
            },
            totalDuration: {
                $sum: "$duration"
            }
        }
        const query = [
            { $match: matchQuery },
            { $group: groupQuery }
        ]

        if (project.length) {
            query[0].$match.project = project
        }

        const results = await collection.aggregate(query).toArray()
    
        if (!results.length) {
            console.error('No entry found')
            return false
        }
        for (let result of results) {
            console.log(`Date: ${utils.formatDate(result._id.date)}, totalDuration: ${utils.formatDuration(result.totalDuration)}`)
        }
        return true
    }
}