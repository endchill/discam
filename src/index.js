import fs from "node:fs"
import fsp from "node:fs/promises"
import { Client, GatewayIntentBits } from "discord.js"
import { logger } from "./logger.js"

const token = process.env.TOKEN
const messages = await Bun.file("../messages.json").json()
const settings = await Bun.file("../settings.json").json()
let date = new Date().toLocaleDateString("en-CA").replace(/-/g, ".")
await fsp.mkdir(`../avatars/${date}`, { recursive: true })

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
})

async function downloadAvatarByMember(member) {
    const format = member.avatar?.startsWith("a_") ? "gif" : settings.avatarFormat
    const filename = `${member.avatar}.${format}`
    logger.info("fetching: ", `Downloading ${member.user.id} "${member.user.username}" avatar.`)
    const avatar = await fetch(member.displayAvatarURL({ size: settings.avatarSize, extension: format }))
    const arrayBuffer = await avatar.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fsp.writeFileSync(filepath, buffer)
    await fsp.symlink(`../avatars/${filename}`, `../avatars/${date}/${filename}`)
}

client.login(token).catch((error) => {
    logger.error("login: ", error.message)
    process.exit(1)
})

client.on("error", (error) => {
    logger.error("", error.message)
})

client.on("clientReady", (c) => {
    logger.info("on clientReady: ", `${c.user.tag}`)
    // const outputChannel = client.channels.cache.get(settings.outputChannelId)
})

client.on("guildMemberUpdate", (oldMember, newMember) => {})

client.on("messageCreate", (message) => {
    if (!message.author.bot && /^(\/usr\/bin\/discam)|^(\/bin\/discam)|^(discam)/.test(message)) {
        if (message.content) {}
        const args = message.content.trim().split(/\s+/)
        const command = {
            binary: args[0],
            options: {
                something: null,
                theme: settings.defaultTheme
            },
            action: null
        }

        for (let i = 1; i < args.length; i++) {
            const arg = args[i]
            if (/=/.test(arg)) {
                switch (arg) {
                    case arg.startsWith("--theme"):
                        const [, value] = arg.slice(2).split("=")
                        command.options.theme = value
                        break
                }
            } else {
                switch (arg) {
                    case "--help":
                        command.action = "help"
                        break
                    case "--overall":
                        command.options.something = "overall"
                        break
                    case "--current":
                        command.options.something = "current"
                        break
                    case "peak":
                        command.action = "peak"
                        break
                }
            }
        }
        console.log(command)
    }
})

client.on('voiceStateUpdate', (oldState, newState) => {
    logger.info("trigger: ", `Detected a change of ${newState.channel.id} state.`)
})
