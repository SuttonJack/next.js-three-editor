import { useEffect } from 'react'

import * as THREE from 'three'
import { Editor } from '../components/editor/Editor'
import { Viewport } from '../components/viewport/Viewport'
import { Toolbar } from '../components/toolbar/Toolbar'
import { Script } from '../components/script/Script'
import { Player } from '../components/player/Player'
import { Sidebar } from '../components/sidebar/Sidebar'
import { Menubar } from '../components/menubar/Menubar'
import { Tools } from '../components/tools/Tools'
import { Resizer } from '../components/resizer/Resizer'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

const ThreeEditor = () => {
  useEffect(() => {
    window.URL = window.URL || window.webkitURL
    window.BlobBuilder =
      window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder

    Number.prototype.format = function () {
      return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    //

    const editor = new Editor()

    window.editor = editor // Expose editor to Console
    window.THREE = THREE // Expose THREE to APP Scripts and Console
    window.VRButton = VRButton // Expose VRButton to APP Scripts

    const ThreeEditor = document.getElementById('three-editor')

    const viewport = new Viewport(editor)
    ThreeEditor.appendChild(viewport.dom)

    const toolbar = new Toolbar(editor)
    ThreeEditor.appendChild(toolbar.dom)

    const script = new Script(editor)
    ThreeEditor.appendChild(script.dom)

    const player = new Player(editor)
    ThreeEditor.appendChild(player.dom)

    const sidebar = new Sidebar(editor)
    ThreeEditor.appendChild(sidebar.dom)

    const tools = new Tools(editor)
    ThreeEditor.appendChild(tools.dom)

    const menubar = new Menubar(editor)
    ThreeEditor.appendChild(menubar.dom)

    const resizer = new Resizer(editor)
    ThreeEditor.appendChild(resizer.dom)

    //

    editor.storage.init(function () {
      editor.storage.get(function (state) {
        if (isLoadingFromHash) return

        if (state !== undefined) {
          editor.fromJSON(state)
        }

        const selected = editor.config.getKey('selected')

        if (selected !== undefined) {
          editor.selectByUuid(selected)
        }
      })

      //

      let timeout

      function saveState() {
        if (editor.config.getKey('autosave') === false) {
          return
        }

        clearTimeout(timeout)

        timeout = setTimeout(function () {
          editor.signals.savingStarted.dispatch()

          timeout = setTimeout(function () {
            editor.storage.set(editor.toJSON())

            editor.signals.savingFinished.dispatch()
          }, 100)
        }, 1000)
      }

      const signals = editor.signals

      signals.geometryChanged.add(saveState)
      signals.objectAdded.add(saveState)
      signals.objectChanged.add(saveState)
      signals.objectRemoved.add(saveState)
      signals.materialChanged.add(saveState)
      signals.sceneBackgroundChanged.add(saveState)
      signals.sceneEnvironmentChanged.add(saveState)
      signals.sceneFogChanged.add(saveState)
      signals.sceneGraphChanged.add(saveState)
      signals.scriptChanged.add(saveState)
      signals.historyChanged.add(saveState)
    })

    //

    document.addEventListener('dragover', function (event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    })

    document.addEventListener('drop', function (event) {
      event.preventDefault()

      if (event.dataTransfer.types[0] === 'text/plain') return // Outliner drop

      if (event.dataTransfer.items) {
        // DataTransferItemList supports folders

        editor.loader.loadItemList(event.dataTransfer.items)
      } else {
        editor.loader.loadFiles(event.dataTransfer.files)
      }
    })

    function onWindowResize() {
      editor.signals.windowResize.dispatch()
    }

    window.addEventListener('resize', onWindowResize)

    onWindowResize()

    //

    let isLoadingFromHash = false
    const hash = window.location.hash

    if (hash.slice(1, 6) === 'file=') {
      const file = hash.slice(6)

      if (confirm('Any unsaved data will be lost. Are you sure?')) {
        const loader = new THREE.FileLoader()
        loader.crossOrigin = ''
        loader.load(file, function (text) {
          editor.clear()
          editor.fromJSON(JSON.parse(text))
        })

        isLoadingFromHash = true
      }
    }

    // ServiceWorker

    // if ('serviceWorker' in navigator) {
    //    try {
    //       navigator.serviceWorker.register('sw.js');
    //    } catch (error) {}
    // }
  })

  return <div id="three-editor"></div>
}

export default ThreeEditor
