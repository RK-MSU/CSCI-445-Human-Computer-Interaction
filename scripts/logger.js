/*!
 * logger.js
 */

class Logger {

	constructor() {
		this.reset()
	}

	reset() {
		this._messages = []
		this._groups   = {}
		this.warnCount = 0
	}

	_addMessage(msg, group) {
		if (group) {
			if (!this._groups[group]) {
				this._groups[group] = []
			}

			this._groups[group].push(msg)
		}
		else {
			this._messages.push(msg)
		}
	}

	warn(title, msg, group) {
		msg = 'WARNING: '.yellow + title.yellow + ' ' + msg

		this._addMessage(msg, group)

		this.warnCount += 1
	}

	log(msg, group) {
		this._addMessage(msg, group)
	}

	showMessages() {
		for (let [title, items] of Object.entries(this._groups)) {
			this._messages.push('\n' + title.bold)
			this._messages.push(...items)
		}

		for (let item of this._messages) {
			console.log(item)
		}

		if (this.warnCount > 0) {
			console.log(`\n${this.warnCount} warnings`.yellow)
		}
	}
}

module.exports = new Logger()
