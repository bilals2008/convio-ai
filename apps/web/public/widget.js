(function () {
  var script = document.currentScript
  var widgetKey = script.getAttribute('data-widget-key')
  if (!widgetKey) return

  var baseUrl = script.src.replace('/widget.js', '').replace('/widget.js/', '')

  var container = document.createElement('div')
  container.id = 'convio-widget-container'
  container.style.cssText = 'all:initial;position:fixed;bottom:0;right:0;z-index:2147483647;width:0;height:0;'

  var iframe = document.createElement('iframe')
  iframe.src = baseUrl + '/widget/demo?embed=true&widgetKey=' + encodeURIComponent(widgetKey)
  iframe.style.cssText =
    'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;z-index:2147483647;max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);box-shadow:0 4px 24px rgba(0,0,0,0.16);border-radius:12px;overflow:hidden;background:#fff;'
  iframe.title = 'Chat Widget'
  iframe.setAttribute('aria-label', 'Chat Widget')

  container.appendChild(iframe)
  document.body.appendChild(container)

  window.addEventListener('message', function (event) {
    if (event.origin !== baseUrl) return
    if (event.data.type === 'convio-resize') {
      iframe.style.width = (event.data.width || 400) + 'px'
      iframe.style.height = (event.data.height || 600) + 'px'
    }
    if (event.data.type === 'convio-toggle') {
      iframe.style.width = iframe.style.width === '0px' ? '400px' : '0px'
    }
  })
})()
