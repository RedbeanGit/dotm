const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const MONTHS_ABR = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'dec']
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAYS_ABR = ['sun', 'mon', 'tues', 'wednes', 'thurs', 'fri', 'satur' ]

const regex = {
    date: {
        months: `((${MONTHS.concat(MONTHS_ABR).join('|')})\\s\\d{1,2})`,
        slash: '(\\d{1,2}/\\d{1,2}(/\\d{1,4})?)',
        days: '(' + DAYS.join('|') + '|' + DAYS_ABR.join('|') + '|yesterday|y' + ')'
    },
    duration: {
        hoursAndMinutes: '(\\d+h?(\\d+m?)?)',
        dotAndComa: '(\\d*[\\.,]\\d+)',
        dash: '(\\d*(am|pm)?-\\d*(am|pm)?)',
        colon: '(\\d+:\\d+)',
        to: '((\\d+(am|pm)?\\s)?to(\\s\\d+(am|pm)?)?)'
    }
}

regex.date.global = `(${regex.date.months}|${regex.date.days}|${regex.date.slash})`
regex.duration.global = `(${regex.duration.hoursAndMinutes}|${regex.duration.dotAndComa}|${regex.duration.dash}|${regex.duration.colon}|${regex.duration.to})`
regex.global = `((${regex.date.global}(,\\s|\\s))?${regex.duration.global})`

regex.date.regex = new RegExp(regex.date.global, 'gmi')
regex.duration.regex = new RegExp(regex.duration.global, 'gmi')
regex.regex = new RegExp(regex.global, 'gmi')

function setDateWithYesterday(now) {
    now.setDate(now.getDate() - 1)
}

function setDateWithNearestDay(date, dayOfWeek) {
    while (date.getDay() != dayOfWeek) {
        date.setDate(date.getDate() - 1)
    }
}

function setDateWithNearestMonth(date, monthOfYear) {
    while (date.getMonth() != monthOfYear) {
        date.setMonth(date.getMonth() - 1)
    }
}

function setDateWithNearestMonthAndDay(date, monthOfYear, dayOfWeek) {
    date.setMonth(monthOfYear)
    date.setDate(dayOfWeek)

    const now = new Date()
    if (now - date < 0) {
        date.setFullYear(date.getFullYear() - 1)
    }
}

function setDateFromSlashs(date, s) {
    let dateField = s.match(/\d+/g)

    if (dateField.length == 3) {
        date.setFullYear(parseInt(dateField[2]))
        date.setMonth(parseInt(dateField[0]) - 1)
        date.setDate(parseInt(dateField[1]))
    } else if (dateField.length == 2) {
        setDateWithNearestMonthAndDay(date, parseInt(dateField[0]) - 1, parseInt(dateField[1]))
    } else {
        return false
    }
    return true
}

function roundDuration(duration) {
    minutes = Math.ceil(duration.getUTCMinutes() / 15) * 15
    duration.setUTCMinutes(minutes)
}

function parseHourInSubstract(rawHour) {
    if (rawHour.includes('am')) {
        let digits = rawHour.match(/\d+/)

        if (digits) {
            return parseInt(digits[0])
        } else {
            return (new Date()).getHours()
        }
    } else if (rawHour.includes('pm')) {
        let digits = rawHour.match(/\d+/)

        if (digits) {
            return parseInt(digits[0]) + 12
        } else {
            return (new Date()).getHours()
        }
    }
}

module.exports = {
    findDuration: s => {
        const duration = s.match(regex.duration.regex)

        if (duration) {
            return duration[0]
        }
        return false
    },
    findDate: s => {
        const date = s.match(regex.date.regex)

        if (date) {
            return date[0]
        }
        return false
    },
    findTimeArg: s => {
        const timeArg = s.match(regex.regex)

        if (timeArg) {
            return timeArg[0]
        }
        return false
    },
    parseDuration: s => {
        const duration = new Date(0)
        s = s.replace(/\s?to\s?/, '-').replace(',', '.').replace(':', 'h')

        if (s.includes('-')) {
            let values = s.split('-')
            
            if (!values[0].match(/(am|pm)/g)) {
                values[0] += 'am'
            }
            if (!values[1].match(/(am|pm)/g)) {
                values[1] += 'pm'
            }
            hour0 = parseHourInSubstract(values[0])
            hour1 = parseHourInSubstract(values[1])

            duration.setUTCHours(hour1 - hour0)
        } else if (s.includes('.')) {
            let value = parseFloat(s)
            let hours = parseInt(value)
            let minutes = parseInt((value - hours) * 60)

            duration.setUTCHours(hours)
            duration.setUTCMinutes(minutes)
        } else if (s.includes('h')) {
            let values = s.split('h')
            duration.setUTCHours(parseInt(values[0]))

            if (values[1] != '') {
                let rawMinutes = parseInt(values[1].match(/\d+/g)[0])
                duration.setUTCMinutes(rawMinutes)
            }
        } else {
            rawValue = parseInt(s.match(/\d+/g)[0])

            if (rawValue < 12) {
                duration.setUTCHours(rawValue)
            } else {
                duration.setUTCMinutes(rawValue)
        
            }
        }
        roundDuration(duration)
        return duration
    },
    parseDate: s => {
        const date = new Date()
        const words = s.toLowerCase().split(' ')

        if (words.length == 2) {
            if (MONTHS.includes(words[0])) {
                setDateWithNearestMonth(date, MONTHS.indexOf(words[0]))
            } else if (MONTHS_ABR.includes(words[0])) {
                setDateWithNearestMonth(date, MONTHS_ABR.indexOf(words[0]))
            } else {
                console.error('Unknown month')
                return false
            }

            if (!isNaN(words[1])) {
                date.setDate(parseInt(words[1]))
            } else {
                console.error('Unknown day')
                return false
            }
        } else if (words.length == 1) {
            if (DAYS.includes(words[0])) {
                setDateWithNearestDay(date, DAYS.indexOf(words[0]))
            } else if (DAYS_ABR.includes(words[0])) {
                setDateWithNearestDay(date, DAYS_ABR.indexOf(words[0]))
            } else if (words[0] == 'yesterday' || words[0] == 'y') {
                setDateWithYesterday(date)
            } else if (words[0].includes('/')) {
                if (!setDateFromSlashs(date, words[0])) {
                    console.error('Bad date format: missing month')
                    return false
                }
            } else {
                console.error('Unknown date')
                return false
            }
        }

        return date
    },
    findTags: description => {
        return description.split(' ').filter(word => word.startsWith('#')).map(word => word.slice(1).toLowerCase())
    },

    formatDate: date => {
        return `${date.month + 1}/${date.day}/${date.year}`
    },
    formatDuration: totalMinutes => {
        const duration = new Date(0)
        duration.setMinutes(totalMinutes)

        const years = duration.getFullYear() - 1970
        const months = duration.getMonth()
        const days = duration.getDate() - 1
        const hours = duration.getUTCHours()
        const minutes = duration.getUTCMinutes()
        
        let formatted = []

        if (years) {
            formatted.push(`${years} year(s)`)
        }
        if (months) {
            formatted.push(`${months} month(s)`)
        }
        if (days) {
            formatted.push(`${days} day(s)`)
        }
        if (hours) {
            formatted.push(`${hours} hour(s)`)
        }
        if (minutes) {
            formatted.push(`${minutes} minute(s)`)
        }
        return formatted.join(' ')
    }
}