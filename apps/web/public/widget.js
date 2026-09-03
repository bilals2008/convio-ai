(function () {
  var script = document.currentScript
  // currentScript can be null for async/injected scripts — fall back to the
  // last <script data-widget-key> on the page.
  if (!script) {
    var scripts = document.querySelectorAll('script[data-widget-key]')
    script = scripts[scripts.length - 1]
  }
  if (!script) return
  var widgetKey = script.getAttribute('data-widget-key')
  if (!widgetKey) return

  var srcPath = (script.src || '').split('?')[0]
  var baseUrl = srcPath.replace(/\/widget\.js\/?$/, '')

  // Idempotency guard: if the snippet runs twice (theme + manual paste, tag
  // manager duplication, SPA re-execution) only the first instance mounts,
  // otherwise customers see two launcher bubbles stacked on top of each other.
  var containerId = 'convio-widget-container-' + widgetKey
  if (document.getElementById(containerId)) return

  var container = document.createElement('div')
  container.id = containerId
  container.style.cssText = 'all:initial;position:fixed;bottom:0;right:0;z-index:2147483647;width:0;height:0;overflow:visible;'

  var iframe = document.createElement('iframe')
  iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups'
  iframe.setAttribute('allowtransparency', 'true')
  iframe.style.cssText =
    'position:fixed;bottom:20px;right:20px;width:0;height:0;border:none;z-index:2147483647;max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);overflow:hidden;color-scheme:none;'
  // Host pages often paint iframes white (`iframe { background:#fff }`). Inline
  // !important plus color-scheme:none keeps the closed launcher canvas clear.
  iframe.style.setProperty('background', 'transparent', 'important')
  iframe.style.setProperty('background-color', 'transparent', 'important')
  iframe.style.setProperty('color-scheme', 'none', 'important')
  iframe.title = 'Chat Widget'
  iframe.setAttribute('aria-label', 'Chat Widget')

  container.appendChild(iframe)
  document.body.appendChild(container)

  var host = ''
  try {
    // Prefer the top-level page host; fall back to the current document host
    // when this page is itself nested in a cross-origin iframe (common with
    // site builders / preview panes), where reading window.top throws.
    host = (window.top && window.top.location && window.top.location.host) || window.location.host
  } catch (e) {
    host = window.location.host
  }

  function buildUrl() {
    var params = 'embed=true&widgetKey=' + encodeURIComponent(widgetKey)
    if (host) params += '&host=' + encodeURIComponent(host)
    // Stable first-party visitor id: lets the server bind conversations to this
    // browser so chat history can't be read by anyone who guesses the id.
    var visitorId = localStorage.getItem('convio:visitorId')
    if (!visitorId) {
      visitorId = crypto.randomUUID ? crypto.randomUUID() : 'v-' + Date.now() + '-' + Math.random().toString(36).slice(2)
      try { localStorage.setItem('convio:visitorId', visitorId) } catch (e) { /* storage unavailable */ }
    }
    params += '&visitorId=' + encodeURIComponent(visitorId)
    // The iframe can't see the embedding page's URL, so pass the path along
    // explicitly — hiddenPages rules match against it.
    params += '&path=' + encodeURIComponent(window.location.pathname)
    return baseUrl + '/widget-entry.html?' + params
  }

  iframe.src = buildUrl()

  function setPosition(pos) {
    if (pos === 'bottom-left') {
      iframe.style.left = '20px'
      iframe.style.right = 'auto'
    } else {
      iframe.style.right = '20px'
      iframe.style.left = 'auto'
    }
  }

  function setOffset(offsetPx) {
    iframe.style.bottom = (20 + (offsetPx || 0)) + 'px'
  }

  // Fetch a short-lived signed token from the API. The browser sends the Origin
  // header here (credentials: omit), which is the unspoofable proof that this
  // page's host is allowed for the widget. The iframe then passes the token back
  // on every API call via X-Widget-Token.
  function requestToken(apiUrl) {
    var url = apiUrl + '/public/widgets/' + encodeURIComponent(widgetKey) + '/token?host=' + encodeURIComponent(host)
    fetch(url, { credentials: 'omit', headers: { Accept: 'application/json' } })
      .then(function (res) { return res.ok ? res.json() : null })
      .then(function (body) {
        var token = body && body.data && body.data.token
        if (token) iframe.contentWindow.postMessage({ type: 'convio-token', token: token }, baseUrl)
      })
      .catch(function () { /* token unavailable — fall back to X-Widget-Host */ })
  }

  // Keep the iframe's hiddenPages rules in sync with the embedding page's URL
  // on back/forward navigation (hash changes too). PushState-only SPA routes
  // aren't tracked — patching history could break the host site's router.
  function notifyPath() {
    iframe.contentWindow.postMessage({ type: 'convio-path', path: window.location.pathname }, baseUrl)
  }
  window.addEventListener('popstate', notifyPath)
  window.addEventListener('hashchange', notifyPath)

  window.addEventListener('message', function (event) {
    if (event.origin !== baseUrl || event.source !== iframe.contentWindow) return
    if (event.data.type === 'convio-init' && event.data.apiUrl) {
      requestToken(event.data.apiUrl)
    }
    if (event.data.type === 'convio-resize') {
      if (event.data.fullscreen && event.data.open) {
        iframe.style.left = '0'
        iframe.style.right = '0'
        iframe.style.bottom = '0'
        iframe.style.width = '100vw'
        iframe.style.height = '100vh'
        iframe.style.maxWidth = 'none'
        iframe.style.maxHeight = 'none'
        iframe.style.borderRadius = '0'
        iframe.style.boxShadow = 'none'
        return
      }
      iframe.style.bottom = (20 + (event.data.offset || 0)) + 'px'
      iframe.style.maxWidth = 'calc(100vw - 40px)'
      iframe.style.maxHeight = 'calc(100vh - 40px)'
      iframe.style.width = (event.data.width || 0) + 'px'
      iframe.style.height = (event.data.height || 0) + 'px'
      iframe.style.borderRadius = event.data.open ? '16px' : (event.data.launcherRadius || '50%')
      iframe.style.setProperty('background', 'transparent', 'important')
      iframe.style.setProperty('background-color', 'transparent', 'important')
      setPosition(event.data.position)
      if (event.data.open) {
        iframe.style.boxShadow = '0 4px 24px rgba(0,0,0,0.16)'
      } else {
        iframe.style.boxShadow = 'none'
      }
    }
  })
})()
