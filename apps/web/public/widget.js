(function () {
  var script = document.currentScript
  var widgetKey = script.getAttribute('data-widget-key')
  if (!widgetKey) return

  var baseUrl = script.src.replace('/widget.js', '').replace('/widget.js/', '')

  var container = document.createElement('div')
  container.id = 'convio-widget-container'
  container.style.cssText = 'all:initial;position:fixed;bottom:0;right:0;z-index:2147483647;width:0;height:0;'

  var iframe = document.createElement('iframe')
  var params = 'embed=true&widgetKey=' + encodeURIComponent(widgetKey)
  try {
    if (window.top && window.top.location && window.top.location.host) {
      params += '&host=' + encodeURIComponent(window.top.location.host)
    }
  } catch (e) {
    /* cross-origin parent access blocked — host param omitted, falls back to origin check */
  }
  iframe.src = baseUrl + '/widget/demo?' + params
  iframe.style.cssText =
    'position:fixed;bottom:20px;right:20px;width:0;height:0;border:none;z-index:2147483647;max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);border-radius:12px;overflow:hidden;background:transparent;'
  iframe.title = 'Chat Widget'
  iframe.setAttribute('aria-label', 'Chat Widget')

  container.appendChild(iframe)
  document.body.appendChild(container)

  window.addEventListener('message', function (event) {
    if (event.origin !== baseUrl) return
    if (event.data.type === 'convio-resize') {
      iframe.style.width = (event.data.width || 0) + 'px'
      iframe.style.height = (event.data.height || 0) + 'px'
      if (event.data.open) {
        iframe.style.boxShadow = '0 4px 24px rgba(0,0,0,0.16)'
        iframe.style.background = '#fff'
      } else {
        iframe.style.boxShadow = 'none'
        iframe.style.background = 'transparent'
      }
    }
  })
})()
