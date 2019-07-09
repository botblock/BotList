# BotList
A package for easily updating your bot count on all Discord bot lists.

## Getting Started
To install the package, you can simply run `npm i botlist` in your bot directory. After the installation is complete, you can append the code below to your bot, which you may need to modify depending on the structure of your bot.

```js
const BotList = require('botlist');

const botID = 'xxx';

const client = new BotList.Client(botID, {
    tokens: {
        'botlist.space': 'xxx',
        'botsfordiscord.com': 'xxx',
        'bots.ondiscord.xyz': 'xxx',
        'botsparadiscord.xyz': 'xxx',
        'carbonitex.net': 'xxx',
        'dankbotlist.com': 'xxx',
        'discordapps.dev': 'xxx',
        'discord.boats': 'xxx',
        'discordbots.org': 'xxx',
        'discordbotlist.com': 'xxx',
        'discordbotreviews.xyz': 'xxx',
        'discordbot.world': 'xxx',
        'discord.bots.gg': 'xxx',
        'discordbotslist.us.to': 'xxx',
        'discordbots.group': 'xxx',
        'discord.services': 'xxx',
        'discordsbestbots.xyz': 'xxx',
        'discordbots.fun': 'xxx',
        'divinediscordbots.com': 'xxx',
        'lbots.org': 'xxx',
        'mythicalbots.xyz': 'xxx',
        'wonderbotlist.com': 'xxx',
        'botlist.co': 'xxx',
        'thereisabotforthat.com': 'xxx'
        // You can append more tokens here if more bot list websites exist on BotBlock
    },
    interval: 1000 * 30, // The interval (in milliseconds) to post to every list
    verbose: false // Logs posting errors to console
});

client.on('beforePost', () => {
    // This event will be fired every interval that is defined in the client constructor. If the client isn't ready yet, you can simply return before calling Client#update(). This will send the previous server/shard count instead.
    
    if (!bot.ready) return;

    const serverCount = bot.guilds.size;
    const shards = bot.shards.size;

    client.update(serverCount, shards); // Instead of `shards` being a number, you can use the following format to post from an individual shard instead (count means server count from this shard): { id: 0, count: 25 }
});

client.on('afterPost', (successful, failed) => {
    console.log('Just finished posting to all bot lists, ' + successful + ' were successful, ' + failed + ' failed to post');
});

client.on('error', (error) => {
    // There was an error posting to one of the lists, the `error` variable will provide details from the node-fetch package about the error.

    console.warn('Something happened', error);
});

// Once the bot is ready, you can call this function to start the interval loop.
client.start();

// If the bot disconnects, you can call this to stop it from running.
client.stop();
```

## Documentation
There is no documentation because the code above is thoroughly documented using comments. If you need any assistance, you can join our *makeshift* support server: [https://discord.gg/GjEWBQE](https://discord.gg/GjEWBQE).