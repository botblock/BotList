const fetch = require('node-fetch');
const EventEmitter = require('events').EventEmitter;

class Client extends EventEmitter {
	constructor(id, options) {
		super();

		this._id = id;
		this._lists = {};
		this._interval = null;
		this._isRunning = false;
		this._serverCount = null;
		this._shards = null;
		this._options = Object.assign({ tokens: {}, interval: 1000 * 30, verbose: false }, !!options && options.constructor === Object ? options : {});

		this._fetchLists();
		this._fetchInterval = setInterval(this._fetchLists.bind(this), 1000 * 60 * 5);

		if (this._options.interval > Math.pow(2, 31)) throw new Error('The provided interval (' + this.options.interval + ') is over the maximum safe integer of ' + Math.pow(2, 31));
	}

	start(callback) {
		if (!this || this.constructor !== Client) throw new Error('The Client#start() method was called from a bound context, please call it normally');

		if (this._isRunning) {
			if (this._options.verbose) console.warn('Attempted to call Client#start() but the client has already started');
			if (callback) return callback(new Error('Attempted to call Client#start() but the client has already started'));
			return Promise.reject(new Error('Attempted to call Client#start() but the client has already started'));
		} else {
			this.emit('start', true);

			this._isRunning = true;
			this._interval = setInterval(() => {
				this.emit('beforePost', Date.now());

				this._sendRequests();
			}, this._options.interval);
		}
	}

	update(serverCount, shards) {
		if (!this || this.constructor !== Client) throw new Error('The Client#update() method was called from a bound context, please call it normally');

		this._serverCount = serverCount;
		this._shards = shards;
	}

	stop(callback) {
		if (!this || this.constructor !== Client) throw new Error('The Client#stop() method was called from a bound context, please call it normally');

		if (this._isRunning) {
			this.emit('stop', true);
			clearInterval(this._interval);
			this._isRunning = false;
			this._interval = null;
		} else {
			if (this._options.verbose) console.warn('Attempted to call Client#stop() but the client has already stopped');
			if (callback) return callback(new Error('Attempted to call Client#stop() but the client has already stopped'));
			return Promise.reject(new Error('Attempted to call Client#stop() but the client has already stopped'));
		}
	}

	_fetchLists() {
		fetch('https://botblock.org/api/lists')
			.then(res => res.json())
			.then(res => {
				this._lists = res;
			})
			.catch(err => {
				this.emit('error', err);

				if (Object.keys(this._lists).length < 1) {
					setTimeout(this._fetchLists.bind(this), 1000 * 5);
				}
			});
	}

	_sendRequests() {
		const tokens = Object.entries(this._options.tokens).filter(entry => this._lists.hasOwnProperty(entry[0]) && this._lists[entry[0]].api_post);
		let index = 0;
		let successful = 0;
		let failed = 0;

		const nextSite = () => {
			if (index >= tokens.length) {
				this.emit('afterPost', successful, failed);
			} else {
				const token = tokens[index];
				const list = this._lists[token[0]];

				const body = {};

				body[list.api_field] = this._serverCount;

				if (list.api_shards && !!this._shards && this._shards.constructor === Array) {
					body[list.api_shards] = this._shards;
				}

				if (list.api_shard_id && !!this._shards && this._shards.constructor === Object && this._shards.hasOwnProperty('id')) {
					body[list.api_shard_id] = this._shards.id;
				}

				if (list.api_shard_count && !!this._shards && this._shards.constructor === Object && this._shards.hasOwnProperty('count')) {
					body[list.api_shard_count] = this._shards.id;
				}

				fetch(list.api_post.replace(/:id/g, this._id), {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', Authorization: token[1] },
					body: JSON.stringify(body)
				})
					.then(res => {
						if (res.status < 300) {
							this.emit('post', token[0]);
							successful++;
						} else {
							this.emit('error', res);
							failed++;
						}

						index++;
						nextSite();
					})
					.catch(err => {
						this.emit('error', err);
						failed++;

						index++;
						nextSite();
					});
			}
		};

		nextSite();
	}
}

module.exports = Client;