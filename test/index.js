const BotList = require('../src');

const client = new BotList.Client('527964667721678897', { tokens: { 'botlist.space': 'haha no' }, interval: 5000 });

client.on('post', (site) => {
	console.log('post', site);
});

client.on('error', (err) => {
	console.log(err);
});

client.on('beforePost', () => {
	client.update(Math.floor(Math.random() * 20000), []);
});

client.on('afterPost', (success, failed) => {
	console.log(success, failed);
});

client.start();