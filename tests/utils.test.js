const { findTimeArg, findDate, findDuration, parseDate, parseDuration } = require('../utils')

function formatDate(d) {
    return d.toDateString()
}

function formatDuration(d) {
    return d.getUTCHours() * 60 + d.getUTCMinutes()
}

function testDate(testValue, expectation) {
    expect(formatDate(parseDate(testValue))).toBe(formatDate(expectation))
}

function testDuration(testValue, expectation) {
    expect(formatDuration(parseDuration(testValue))).toBe(expectation)
}

describe('Find time', () => {
    test('Find time argument', () => {
        expect(findTimeArg('node dotm.js December 12 2h mongo this is a test')).toBe('December 12 2h')
    })
    test('Find date', () => {
        expect(findDate('December 12 2h')).toBe('December 12')
    })
    test('Find duration', () => {
        expect(findDuration('2htest')).toBe('2h')
    })
})

describe('Parse dates', () => {
    test('Parse yesterday and y', () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        testDate('y', yesterday)
        testDate('yesterday', yesterday)
    })
    test('Parse days', () => {
        const thursday = new Date()
        const friday = new Date()

        while (thursday.getDay() != 4) {
            thursday.setDate(thursday.getDate() - 1)
        }
        while (friday.getDay() != 5) {
            friday.setDate(friday.getDate() - 1)
        }

        testDate('thursday', thursday)
        testDate('thurs', thursday)
        testDate('Friday', friday)
    })
    test('Parse month and day', () => {
        const october21 = new Date()
        october21.setMonth(9)
        october21.setDate(21)

        const december12 = new Date()
        december12.setMonth(11)
        december12.setDate(12)

        const now = new Date()

        while (october21 - now > 0) {
            october21.setFullYear(october21.getFullYear() - 1)
        }
        while (december12 - now > 0) {
            december12.setFullYear(december12.getFullYear() - 1)
        }

        testDate('Oct 21', october21)
        testDate('December 12', december12)
    })
    test('Parse dates with slashes', () => {
        const february5 = new Date()
        february5.setMonth(1)
        february5.setDate(5)

        const january12017 = new Date()
        january12017.setFullYear(2017)
        january12017.setMonth(0)
        january12017.setDate(1)

        const now = new Date()

        while (february5 - now > 0) {
            february5.setFullYear(february5.getFullYear() - 1)
        }

        testDate('2/5', february5)
        testDate('1/1/2017', january12017)
    })
})

describe('Parse durations', () => {
    test('Parse only digits values', () => {
        testDuration('15', 15)
        testDuration('13', 15)
        testDuration('4', 4*60)
    })
    test('Parse h and m or :', () => {
        testDuration('15m', 15)
        testDuration('15h', 15*60)
        testDuration('2h', 2*60)
        testDuration('6h', 6*60)
        testDuration('2h13', 2*60+15)
        testDuration('1:15', 1*60+15)
        testDuration('2:45', 2*60+45)
    })
    test('Parse substract', () => {
        const now = new Date()

        testDuration('9-5', 8*60)
        testDuration('9-', (now.getHours() - 9)*60)
        testDuration('10 to', (now.getHours() - 10)*60)
        testDuration('2pm-4pm', 2*60)
    })
    test('Parse . or ,', () => {
        testDuration('1,17', 1*60+15)
        testDuration('1,5', 1*60+30)
        testDuration('3.5', 3*60+30)
        testDuration('2.75', 2*60+45)
        testDuration('.5', 30)
        testDuration('.99', 1*60)
    })
})