import fsp from "node:fs/promises";
import { Client, GatewayIntentBits } from "discord.js";
import { cron } from "croner";
import { dirname, join } from "node:path";
import { isExists, downloadAvatarByMember } from "./functions.js";
import { logger } from "./logger.js";

const token = process.env.TOKEN;
const rootDir = dirname(import.meta.dir);
const avatarsDir = join(rootDir, "avatars");
const messages = await Bun.file(join(rootDir, "messages.json")).json();
const settings = await Bun.file(join(rootDir, "settings.json")).json();
const timezone = settings.timezone === "auto" ? Intl.DateTimeFormat().resolvedOptions().timeZone : settings.timezone;

if (!(await isExists(avatarsDir))) {
    await fsp.mkdir(avatarsDir, { recursive: true });
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

new cron("0 0 * * *", { timezone: timezone }, () => { });

client.login(token).catch((error) => {
    logger.error("login: ", error.message);
    process.exit(1);
});

client.on("error", (error) => {
    logger.error("", error.message);
});

client.on("clientReady", (c) => {
    logger.info("on clientReady: ", `${c.user.tag}`);
    // const outputChannel = client.channels.cache.get(settings.outputChannelId)
});

client.on("guildMemberUpdate", (oldMember, newMember) => { });

client.on("messageCreate", (message) => {
    if (
        !message.author.bot &&
        /^(\/usr\/bin\/discam)|^(\/bin\/discam)|^(discam)/.test(message)
    ) {
        if (message.content) {
        }
        const args = message.content.trim().split(/\s+/);
        const command = {
            binary: args[0],
            options: {
                action: null,
                theme: settings.defaultTheme,
                useRulesColors: settings.isRulesColor,
            },
            action: null,
        };

        for (let i = 1; i < args.length; i++) {
            const arg = args[i];
            if (/=/.test(arg)) {
                switch (arg) {
                    case arg.startsWith("-t"):
                    case arg.startsWith("--theme"):
                        if (i + 1 < args.length) {
                            command.options.theme = args[++i];
                        }
                        break;
                    case arg.startsWith("-r"):
                    case arg.startsWith("--use-rules-color"):
                        if (i + 1 < args.length) {
                            command.options.useRulesColors = args[++i];
                        }
                        break;
                }
            } else {
                switch (arg) {
                    case "-h":
                    case "--help":
                        command.action = "help";
                        break;
                    case "-o":
                    case "--overall":
                        command.options.action = "overall";
                        break;
                    case "-c":
                    case "--current":
                        command.options.action = "current";
                        break;
                    case "peak":
                        command.action = "peak";
                        break;
                    // default:
                }
            }
        }
        console.log(command);
    }
});
