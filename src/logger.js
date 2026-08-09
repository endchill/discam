import { appendFileSync } from "node:fs"

// logger.<log_type>("<message_title>", <message>)

const levels = {
    info:  "[INFO]",
    warn:  "[WARN]",
    error: "[ERROR]"
}

const levelsColored = {
    info:  "\x1b[34m[INFO]\x1b[0m",
    warn:  "\x1b[33m[WARN]\x1b[0m",
    error: "\x1b[31m[ERROR]\x1b[0m"
}

function log(level, module, message) {
    const date = new Date()
    const time = date.toISOString()
    const filename = date.toLocaleDateString('en-CA').replace(/-/g, '.')
    appendFileSync(`../logs/${filename}.log`, `${time} ${levels[level]} ${module}${message}\n`)
    console.log(`${time} ${levelsColored[level]} ${module}${message}`)
}

export const logger = {
    info:  (module, message) => log("info",  module, message),
    warn:  (module, message) => log("warn",  module, message),
    error: (module, message) => log("error", module, message)
}
