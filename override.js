/**
 * Created by gordianknot on 20/9/16.
 */
/**
 *
 * @param [string] libs
 *
 * usage:
 * libraries = ['jQuery', '_', 'showdown']
 * $handler = new StartupHandler(...libraries)
 *     $handler.onLibrariesInitialized(function(handler){
 *     $webapp = new GoogleKeepMarkdownRenderingApp()
 * })
 */
class _$StartupHandler$_ {
   constructor(search_name=[], instances=[]) {
      this.ensureStringArray(search_name)
      this.ensureStringArray(instances)
      this.libraries = instances
      this.installLibraries(search_name)
      this.startup_delay = 400
      this.triggerPending()
      this.script_src = document.getElementsByTagName('head')[0]
         .appendChild(document.createElement('script'))
      //document.getElementsByTagName('head')[0]
      //   .getElementsByTagName('script')
      //   .bind("DOMSubtreeModified", function () {
      //      this._onLibraryLoaded()
      //   });
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
         if (typeof(el) != 'string') new Error('invalid libraries assignment')
      })
   }

   testLibrariesLoaded() {
      for (let l of this.libraries) {
         if (eval(l) == undefined)
            return false
      }
      return true
   }

   onLibraryLoaded(fn) {
      new Error('Not Implemented yet')
      this.onLibraryLoaded = fn.bind(this)
   }

   _onLibraryLoaded() {
      new Error('Not Implemented yet')
      this.onLibraryLoaded()
   }

   onLibrariesInitialized(fn) {
      this.onLibrariesInitialized = fn.bind(this)
   }

   _onLibrariesInitialized(...params) {
      function someAction() {
         let scripts =
                document.getElementsByTagName('head')[0]
                   .getElementsByTagName('script')
         for (let l of scripts) {
            l.setAttribute('addedBy', 'server')
         }
      }

      someAction()
      this.onLibrariesInitialized()
   }

   installLibraries(libs) {
      // jquery-lang.js lodash.js showdown
      var xhttp = new XMLHttpRequest(),
          cdnjs = `https://api.cdnjs.com/libraries?search=${lib.name}`,
          script = this.script_src

      xhttp.onreadystatechange = function () {
         if (xhttp.readyState == XMLHttpRequest.DONE) {
            if (xhttp.status == 200) {
               let json = JSON.parse(xhttp.responseText).results.slice(0, 20)
               script.setAttribute('src', json[0].latest)
            }
            else if (xhttp.status == 400) {
               alert('There was an error 400');
            }
            else {
               alert('something else other than 200 was returned');
            }
         }
      };
      for (let lib of libs) {
         lib = {name: lib}
         console.log('js:', cdnjs)
         xhttp.open("GET", cdnjs, true);
         xhttp.send()
      }
   }
}



