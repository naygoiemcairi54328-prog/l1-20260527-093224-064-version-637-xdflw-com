function initMoviePlayer(videoId, overlayId, sourceUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hlsInstance = null;
  var ready = false;

  function attachSource() {
    if (!video || ready) return;
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function playVideo() {
    if (!video) return;
    attachSource();
    if (overlay) overlay.classList.add('is-hidden');
    video.controls = true;
    var task = video.play();
    if (task && typeof task.catch === 'function') {
      task.catch(function() {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function() {
      if (video.paused) playVideo();
    });
    video.addEventListener('ended', function() {
      if (overlay) overlay.classList.remove('is-hidden');
    });
  }

  window.addEventListener('beforeunload', function() {
    if (hlsInstance) hlsInstance.destroy();
  });
}
