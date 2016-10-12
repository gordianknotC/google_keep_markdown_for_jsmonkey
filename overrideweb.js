// ==UserScript==
// @name              googleKeep
// @namespace    googleKeep
// @include          https://keep.google.com
// @include          https://keep.google.com/*

// ==UserScript==
/*
 *
 * Google Keep Markdown Implementation
 * Paste following code to your chrome console when surfing google keep, user script plugin like "taper monkey" or NinjaKit currently not working.
 */


class _$StartupHandler$_ {
	constructor(instances_chk) {
		this.ensureStringArray(instances_chk)
		this.script_src = document.getElementsByTagName('head')[0].appendChild(document.createElement('script'))

		console.log('check if library:', instances_chk, 'loaded')
		this.libraries = instances_chk
		this.startup_delay = 400
		this.triggerPending()
	}


	triggerPending() {
		setTimeout(this.pending.bind(this), this.startup_delay)
	}

	pending() {
		if (!this.testLibrariesLoaded()) {
			this.triggerPending()
			return
		}
		console.info('------------------STARTUP-----------------------------------')
		console.info('added JSLib:', this.libraries)
		this._onLibrariesInitialized()
	}

	ensureStringArray(array) {
		array.forEach(function (el) {
			if (typeof(el) != 'string') throw new Error('invalid libraries assignment')
		})
	}

	testLibrariesLoaded() {
		for (let l of this.libraries) {
			if (eval(l) === undefined) return false
		}
		console.log('lib all loaded')
		console.log(this.libraries)
		return true
	}

	onLibraryLoaded(fn) {
		throw new Error('Not Implemented yet')
		this.onLibraryLoaded = fn.bind(this)
	}

	_onLibraryLoaded() {
		throw new Error('Not Implemented yet')
		this.onLibraryLoaded()
	}

	onLibrariesInitialized(fn) {
		this.onLibrariesInitialized = fn.bind(this)
	}

	_onLibrariesInitialized(...params) {
		function someAction() {
			let scripts =
			document.getElementsByTagName('head')[0].getElementsByTagName('script')
			for (let l of scripts) {
				l.setAttribute('addedBy', 'server')
			}
		}

		someAction()

		this.onLibrariesInitialized()
	}

	installLibraries(libs) {
		// jquery-lang.js lodash.js showdown
		for (let lib of libs) {
			this.script_src.setAttribute('src', lib)
		}
	}
}


console.log('_____________________1_______________________')


class Note {
	// usage: var note = new Note( jquery_object )
	constructor(jquery_object) {
		this.__proto__ = jquery_object
		this.note = this

		if (this.note.attr('rendered') == undefined) {
			this._rawText = this.note[0].innerText
			if (this._rawText == "記事") console.error('Note constructor, text:', this._rawText) console.info('note:', this.note[0], this.parent().attr('uuid')) console.info('parent:', this.note.parent()[0]) console.log('___________________________') this.note.attr('rendered', 'false')
		} else {
			//repack instance
			throw new Error("Can't instantiate twice")
		}

		var self = this
		Object.defineProperties(this, {
			'rendered': {
				get: () = > self.note.attr('rendered'),
				set: (value) = > self.note.attr('rendered', value)
			},
			'rawText': {
				get: () = > self._rawText,
				set: function (value) {
					self.setText(value)
				}
			}
		})

		this.setHtml = function (html, max_tryout = 3) {
			console.log('setHtml', self.note[0])
			self.rendered = 'true'
			self.note[0].innerHTML = html
			console.info('setted:', self.note[0].innerHTML == html)
			if (self.note[0].innerHTML != html) {
				setTimeout(function () {
					if (max_tryout > 0 && NoteFrame.modal_state == ModalState.Leaved) self.setHtml(html, max_tryout - 1)
				}, 400)
			}
		}
		this.setText = function (text) {
			console.log('setText')
			console.log(text)
			self.rendered = 'false'
			self.note[0].innerHTML = text
			self._rawText = text
			if (text == "記事") console.error('setText:', text)
		}
		this.renderTextToHtml = function (force = false) {
			var text, html, converter = NoteFrame.converter
			text = self.rawText

			console.log('renderTextToHtml => text:', text)
			if (self.rendered == 'true') {
				if (force == true) {
					html = StylesInit.pre_code_processor(converter.makeHtml(text))
				} else {
					return
				}
			} else if (self.rendered == 'false') {
				html = StylesInit.pre_code_processor(converter.makeHtml(text))
				console.log('renderTextToHtml => html:', html)
			} else {
				throw new Error('Uncaught Error for property: "rendered" cannot be null')
			}
			this.setHtml(html)
		}
		this.updateText = function (text) {
			self.rawText = text
		}
		this.restoreText = function () {
			self.rendered = 'false'
			self.note[0].innerHTML = self.rawText
		}
		this.restoreTextToModal = function () {
			self.rendered = 'false'
			self.parent().modal_note[0].innerHTML = self.rawText
		}
	}
}

class NoteFrame {
	constructor(note_instance) {
		var self = this
		this.__proto__ = note_instance.parent()

		if (this.attr('uuid') == undefined) {
			var uuid = NoteFrame.getUUID()
			this.note = note_instance
			this.attr('uuid', uuid)
			this._uuid = uuid
			this.note.parent = () = > this

			if (NoteFrame.__init__ != true) {
				NoteFrame._note_frames = {}
				NoteFrame._note_frames[uuid] = this
				NoteFrame.__init__()
			} else {
				NoteFrame._note_frames[uuid] = this
			}

			this.bind('click', (e) = > self._onClick(e))
			// define instance methods
			self._onClick = function (e) {
				console.log('onclick, uuid:', self.uuid)
				console.log('click event:', e)
				self.modal_id = self.uuid
				ModalState.stateInit('onClick')
			}

		} else {
			throw new Error('you cannot instantiate NoteFrame twice in the same HTMLDOMNode')
		}

		// define instance properties
		Object.defineProperties(this, {
			'uuid': {
				get: () = > self._uuid
			},
			// set onClick to override default _onClick method
			'onClick': {
				set: function (fn) {
					self._onClick = function (e) {
						// NoteFrame.onClick( function(evt, noteFrame_instance){} )
						fn(e, self)
					}
				}
			},
			// @return uuid<string> modal_id
			'modal_id': {
				get: () = > NoteFrame.modal_id,
				set: (value) = > NoteFrame.modal_id = value
			},
			// @return jqueryObject modal
			'modal': {
				get: () = > NoteFrame.modal
			},
			// @return jQueryObject modal_note
			'modal_note': {
				get: () = > NoteFrame.modal.find('div[spellcheck]').eq(1)
			},
			// @return boolean modal_state
			'modal_state': {
				get: () = > NoteFrame.modal_state
			},
			// @return {uuid:NoteFrame} _note_frames
			'note_frames': {
				get: () = > NoteFrame._note_frames
			}
		})
	}

	//------------------------------------
	//        Static Properties
	//------------------------------------
	static set modal_id(id) {
		// 在理想上 trigger onchange應由modal id的設值來控制
		// 但是google keep有自已的機制，所以只能順著google keep來做
		// In ideal, it's essential to control onModalAction state by listening
		// value assignment of modal_id, but in fact google keepp has it's own
		// mechanism to control this that breaks my original implementation
		//NoteFrame.onModalChanged(id)
		NoteFrame._modal_id = id
	}

	static get modal_id() {
		return NoteFrame._modal_id
	}

	static get modal() {
		return $('div[role=tooltip]').next().next()
	}

	static get modal_state() {
		return NoteFrame._modal_state
	}

	static set modal_state(value) {
		NoteFrame._modal_state = value
	}

	// -----------------------------------
	//          Static Methods
	//------------------------------------
	static __init__() {
		console.log('NoteFrame__init__            OK')
		NoteFrame._modal_id = null
		NoteFrame._modal_state = ModalState.Leaved
		NoteFrame.__init__backup = NoteFrame.__init__
		NoteFrame.__init__ = true
		NoteFrame.converter = new showdown.Converter()
		NoteFrame.update_triggered = false
		NoteFrame.trigger_interval = 1000
		NoteFrame.trigger_stack = []
		NoteFrame.note_frame_container = $('div[data-ogpc]>div:nth-last-child(2)>div')

		NoteFrame.note_frame_container.bind('DOMContentLoaded', function (e) {
			console.info('---------------------------------------')
			console.info(' >>>>>')
		})

		NoteFrame.note_frame_container.bind("DOMNodeInserted", NoteFrame.trigger_onNotesUpdate);

		NoteFrame.modal.bind('DOMFocusOut', function (e) {
			NoteFrame.modal_temp = e
			console.log('modal stat:', NoteFrame.modal_state)
			console.log('>>> dom DOMFocusOut loaded:', e.currentTarget)
			ModalState.stateInit('focusOut')
		})

		NoteFrame.modal.bind('DOMFocusIn', function (e) {
			NoteFrame.modal_temp = e
			console.log('modal stat:', NoteFrame.modal_state)
			console.log('>>> dom DOMFocusIn loaded:', e.currentTarget)
			ModalState.stateInit('focusIn')
		})
		new CustomMarkdownConverter(NoteFrame.converter)
	}

	static clear() {
		NoteFrame._note_frames = {}
		NoteFrame.__init__ = NoteFrame.__init__backup
	}

	static get modal_note() {
		return NoteFrame.modal.find('div[spellcheck]').eq(1)
	}

	static getUUID() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}

		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}


	static onModalEnter(uuid, max_tryout = 10) {
		// 1) fetch raw text from corresponding note
		// 2) _setNoteToText
		// 3) copy raw text into modal for editing
		console.log('onModalEnter', uuid)
		//var note       = NoteFrame.getNoteFrameByUUID(uuid).note,
		//    text       = note.rawText,
		//    modal_note = NoteFrame.modal_note
		//console.log('modal_note:', modal_note)
		//console.log('text:', text)
		//modal_note[0].innerHTML = text
		//note.setText(text)
	}

	static onModalLeave(uuid, max_tryout = 10) {
		// 1) copy raw text from modal
		// 2) renderNoteById
		console.log('onModalLeave', uuid)
		//var note       = NoteFrame.getNoteFrameByUUID(uuid).note,
		//    modal_note = NoteFrame.modal_note
		//console.log('text before leave:', note.note[0].innerText)
		//note.setText(note.note[0].innerText)
		//note.renderTextToHtml( true)
	}

	static onNewNotesFetched() {
		NoteFrame.instantiateNotes()
		NoteFrame.renderAllNotes()
		//let notes = NoteFrame.getRenewedNotes()
		//if (notes.length > 0)
		//   NoteFrame.instantiateNotes(notes)
	}

	static _onNewNotesFetched() {
		NoteFrame.onNewNotesFetched()
	}

	static trigger_onNotesUpdate() {
		if (!this.update_triggered) {
			this.update_triggered = true
			let id = setTimeout(function () {
				NoteFrame.triggered = false
				NoteFrame.trigger_stack = []
				NoteFrame._onNewNotesFetched()
			}, NoteFrame.trigger_interval)

			NoteFrame.trigger_stack.push(id)
			return
		}
		NoteFrame.update_triggered = false
		let id = NoteFrame.trigger_stack.pop()
		clearTimeout(id)
		NoteFrame.trigger_onNotesUpdate()
	}


	static getNoteFrameByUUID(uuid) {
		return this._note_frames[uuid]
	}

	static getNoteByUUID(uuid) {
		return NoteFrame.getNoteFrameByUUID(uuid).note
	}

	static _getModalId(fn) {
		throw new Error('Not Implement Yet, you need to bindModalId(fn) first')
	}

	static getAllNotes() {
		return $('div[data-ogpc]>div:nth-last-child(2)>div>div>div:nth-last-child(1)>div:nth-last-child(3)>div:nth-last-child(4)')
	}

	static getNewNotes() {
		return $('div[data-ogpc]>div:nth-last-child(2)>div>div>div:nth-last-child(1)>div:nth-last-child(3):not([uuid])>div:nth-last-child(4)')
	}


	static getNewFrames() {
		return $('div[data-ogpc]>div:nth-last-child(2)>div>div>div:nth-last-child(1)>div:nth-last-child(3):not([uuid])')
	}

	static getModal() {
		let modal = $('div[role=tooltip]').next().next()
		return modal
	}

	static isIgnoreRendering(note) {
		if (note.has('div[aria-checked]').length == 0) return false
		return true
	}

	static renderAllNotes() {

		for (let note_frame of _.values(NoteFrame._note_frames)) {
			if (!NoteFrame.isIgnoreRendering(note_frame.note)) note_frame.note.renderTextToHtml()
		}
	}


	static instantiateNotes() {
		let new_notes = $('div[data-ogpc]>div:nth-last-child(2)>div>div>div:nth-last-child(1)>div:nth-last-child(3):not([uuid])>div:nth-last-child(4)')
		new_notes.each(function (n) {
			new NoteFrame(new Note($(this)))
		})

	}

}


class CustomMarkdownConverter {
	constructor(converter) {
		converter.listen('images.before', this.beforeParsingImages.bind(this))
		converter.listen('images.after', this.afterParsingImages.bind(this))
	}

	beforeParsingImages(evtName, text, converter, options) {
		return text
	}

	afterParsingImages(evtName, text, converter, options) {
		return text
	}
}


class StylesInit {
	constructor() {
		var $styles = ` < style > code {
			white - space: pre - wrap;
			font - family: Consolas,
			"Liberation Mono",
			Courier,
			monospace;
		}
		pre {
			white - space: pre - wrap; /* Since CSS 2.1 */
			white - space: -moz - pre - wrap; /* Mozilla, since 1999 */
			white - space: -pre - wrap; /* Opera 4-6 */
			white - space: -o - pre - wrap; /* Opera 7 */
			word - wrap: break -word; /* Internet Explorer 5.5+ */
		} < /style>
`
      $('head').append($styles)
      
   }
   
   static pre_code_processor(html) {
      var overall_search = / ( < \ / code > ) / g
		var sub_search = /(<code [\w\W]+)/
		var general_html = /\n/g
		var ret = []
		for (let code_block of html.split(overall_search)) {
			var match = code_block.match(sub_search)
			if (match != null) {
				ret.push(match[0] + "</code>")
			} else {
				if (code_block != "</code>") ret.push(code_block.replace(general_html, ''))
			}
		}
		return ret.join('\n')
	}
}


class ModalState {
	static enteringAction() {
		let modal_note = NoteFrame.modal_note
		let note = NoteFrame.getNoteByUUID(NoteFrame.modal_id)

		if (note.rawText == "記事") console.error('enteringAction:', note.rawText) try {
			modal_note[0].innerHTML = note.rawText
		} catch (e) {}
	}

	static leavingAction() {
		var note = ModalState.leavingBackup()
		note.renderTextToHtml(true)
		NoteFrame.modal_id = null
	}

	static leavingBackup() {
		var note = NoteFrame.getNoteFrameByUUID(NoteFrame.modal_id).note,
			modal_note = NoteFrame.modal_note
		try {
				console.info('backup text for leaving:', modal_note[0].innerText)
				note.rawText = modal_note[0].innerText
			} catch (e) {

			}
		return note
	}

	static triggerBy_WaitFor_AndDo(trigger, waitfor, act) {

	}

	static actionInit(action) {

	}

	static stateInit(action) {

		switch (NoteFrame.modal_state) {
		case ModalState.Leaved:
			switch (action) {
			case 'onClick':
				ModalState.enteringAction()
				NoteFrame.modal_state = ModalState.EnteringWaitForStop
				console.info('click on enter, trigger action')
				break
			case 'mainMenu':
				NoteFrame.modal_state = ModalState.JustEntering
				break
				throw Error('Uncaught switch error')
			}
			break
		case ModalState.JustEntering:
			switch (action) {
			case 'onClick':
				ModalState.enteringAction()
				NoteFrame.modal_state = ModalState.EnteringWaitForStop
				console.info('click on enter, trigger action')
				break
			case 'mainMenu':
				break
				throw Error('Uncaught switch error')
			}
			break
		case ModalState.EnteringWaitForStop:
			switch (action) {
			case 'mainMenu':
				ModalState.enteringAction()
				break
			case 'focusIn':
				break
			case 'focusOut':
				ModalState.enteringAction()
				NoteFrame.modal_state = ModalState.Entered
				console.info('go into Entered mode, trigger enter action again')
				break
			}
			break
			//--------------------------------------------------
		case ModalState.Entered:
			switch (action) {
			case 'focusOut':
			case 'focusIn':
				ModalState.leavingBackup()
				console.info('backup modal text prepare for leaving')
				break
			case 'mainMenu':
				ModalState.leavingAction()
				console.info('leaving modal mode, enter into Leaved')
				NoteFrame.modal_state = ModalState.Leaved
			}
			break
		}
	}

	static is_entering(state) {
		return state in [ModalState.JustEntering, ModalState.EnteringWaitForStop]
	}

	static is_leaving(state) {
		return state in [ModalState.JustLeaving, ModalState.LeavingWaitForStop]
	}

	static get JustEntering() {
		// 未預期的最初觸發者，無法得知uuid
		return 'JustEntering'
	}

	static get EnteringWaitForStop() {
		// 己得到uuid
		return 'EnteringWaitForStop'
	}

	static get Entered() {
		// 己rendered/settext
		return 'Entered'
	}

	static get JustLeaving() {
		// 己leaving 但此時設值（render/settext）㑹被google keepp原來的機制取消
		return 'JustLeaving'
	}

	static get LeavingWaitForStop() {

		return 'LeavingWaitForStop'
	}

	static get Leaved() {
		return 'Leaved'
	}
}

class GoogleKeepMarkdownRenderingAddon {
	constructor() {
		var main_menu = $('div#ognwrapper'),
			view_mode_bt = $('div.rightProductControls>div:nth-last-child(1)')

		this.main_menu = main_menu
		this.view_mode_bt = view_mode_bt
		this._view_mode = this.view_mode
		NoteFrame.instantiateNotes()
		new StylesInit()
		this.renderInit()
		this.cloneClasses = this.clone({
				'Note': Note,
				'NoteFrame': NoteFrame
			})


	}

	get view_mode() {
		return this.view_mode_bt.attr('aria-label')
	}

	set view_mode(v) {
		if (v == this._view_mode) throw new Error('UnCaught Error') this._view_mode = v this.onViewModeChanged(v)
	}

	noteFramesInit(view_mode) {
		//Note =  null
		//NoteFrame = null
		//Note = eval(this.cloneClasses['Note'])
		//NoteFrame = eval(this.cloneClasses['NoteFrame'])
		NoteFrame.clear()
		NoteFrame.instantiateNotes()
		$handler._onLibrariesInitialized()
	}

	onViewModeChanged(v) {
		this.noteFramesInit(v)
	}

	renewNotes(mode) {

	}

	get frames() {

	}

	get notes() {

	}

	//--------------------------------------------
	//                rendering section
	//--------------------------------------------
	renderInit() {
		console.log('render init >>--------->')
		// render note
		NoteFrame.renderAllNotes()

		// detect entering note edit mode
		var self = this,
			main_menu = this.main_menu

		console.log('bind main menu to SubTreeModifed event', self.main_menu)
		// trigger on enter edit mode from modal_id assignment
		// throught listening to menu's state and clicking on notes
		// 由主meneu的狀態來偵測modal的on/off
		self.main_menu.bind('DOMSubtreeModified ', function () {
				console.log('onMainMenu Changed')
				var menu_hidden = main_menu.attr('aria-hidden') == 'true'

				if (menu_hidden) {
					console.log('detect onclick notes are:')
					console.log('notes has [spellcheck]:', NoteFrame.modal_note.has('[spellcheck="true"]'))
					ModalState.stateInit('mainMenu')
				} else {
					// trigger modal leave
					//NoteFrame.onModalChanged(null)
					ModalState.stateInit('mainMenu')
				}
			})

		self.view_mode_bt.bind('DOMActivate', function (e) {
				self.view_mode = $(this).attr('aria-label')
			})

	}

	getNoteById(id) {
		return _.values(NoteFrame._note_frames)[id].note
	}

	getNoteText(id) {
		return _.values(NoteFrame._note_frames)[id].note.rawText
	}

	getNoteHtml0(id) {
		return NoteFrame.converter.makeHtml(this.getNoteText(id))
	}

	getNoteHtml1(id) {
		return StylesInit.pre_code_processor(NoteFrame.converter.makeHtml(this.getNoteText(id)))
	}

	clone(cls) {
		var ret = {}
		for (let key of _.keys(cls)) {
			ret[key] = cls[key].toString()
		}
		return ret
	}

}
console.log('++++++++++++++++++++++++++++++++++++++++')
var $webapp, $handler


$handler = new _$StartupHandler$_(['jQuery', '_', 'showdown', '_$StartupHandler$_'])
$handler.onLibrariesInitialized(function (handler) {
	$webapp = new GoogleKeepMarkdownRenderingAddon()
	console.log('...........................................')
	console.log('app ready')
	console.log('--------------------------------------------')
})
