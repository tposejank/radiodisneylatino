pauseSvg = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" id="iconPause">
                    <path d="M17 3H15C14.4477 3 14 3.44772 14 4V20C14 20.5523 14.4477 21 15 21H17C17.5523 21 18 20.5523 18 20V4C18 3.44772 17.5523 3 17 3Z" fill="white"></path>
                    <path d="M9 3H7C6.44772 3 6 3.44772 6 4V20C6 20.5523 6.44772 21 7 21H9C9.55228 21 10 20.5523 10 20V4C10 3.44772 9.55228 3 9 3Z" fill="white"></path>
                </svg>`

playSvg = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" id="iconPlay">
                    <path d="M6 4.83167C6 4.0405 6.87525 3.56266 7.54076 3.99049L18.6915 11.1588C19.3038 11.5525 19.3038 12.4475 18.6915 12.8412L7.54076 20.0095C6.87525 20.4373 6 19.9595 6 19.1683V4.83167Z" fill="white"></path>
                </svg>`

loadingSvg = `<svg aria-hidden="true" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#353535"></path><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#8C8B8B"></path></svg>`

downloadSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path id="Vector" d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

function playButtonClicked() {
    const video = document.getElementById('video');
    const playButton = document.getElementById('play-button');

    if (window.attachedAudioSource !== window.lastAudioSource) {
        window.lastAudioSource = window.attachedAudioSource;
        const audioStreamUrl = window.attachedAudioSource;

        const ism3u8 = audioStreamUrl.split('?')[0].endsWith('.m3u8');
        if (ism3u8) {
            if (Hls.isSupported()) {
                var hls = new Hls();
                hls.loadSource(audioStreamUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = audioStreamUrl;
                video.addEventListener('loadedmetadata', function () {
                    video.play();
                });
            }
        } else {
            video.src = audioStreamUrl;
            video.addEventListener('loadedmetadata', function () {
                video.play();
            });
        }
        
        playButton.classList.add('loading');
        playButton.innerHTML = loadingSvg;
    } else {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }
}

function playStation(stationData) {
    console.log('play ' + stationData.name);

    const playButton = document.getElementById('play-button');
    video.pause();
    playButton.innerHTML = playSvg;

    const playerStationInfo = document.getElementById('player-station-name');
    playerStationInfo.innerText = stationData.name + ' ' + stationData.dial;
    document.title = stationData.title;

    const audioSource = stationData.streamingUrl;
    window.attachedAudioSource = audioSource;
}

function loadStationsData(countryCode) {
    console.log('load ' + countryCode)
    const countryStationsArray = window.stationData[countryCode];
    const stationList = document.getElementById('station-list');
    stationList.innerHTML = ''; // Clear previous station list

    countryStationsArray.forEach(station => {
        const stationDiv = document.createElement('div');
        stationDiv.classList.add('station-item');

        const stationControls = document.createElement('div');
        stationControls.classList.add('station-controls');

        const stationInfo = document.createElement('div');
        stationInfo.classList.add('station-info');

        const header = document.createElement('h2');
        header.innerText = station.name;
        const dial = document.createElement('h3');
        dial.innerText = station.dial;
        
        stationInfo.appendChild(header);
        stationInfo.appendChild(dial);

        const playButton = document.createElement('button');
        playButton.innerHTML = downloadSvg;
        playButton.classList.add('load-button');
        playButton.addEventListener('click', function () {
            playStation(station);
        });

        stationControls.appendChild(playButton);
        stationControls.appendChild(stationInfo);
        stationDiv.appendChild(stationControls);
        stationList.appendChild(stationDiv);
    })
}

fetch('/stations.json').then(response => response.json())
.then(data => {
    window.stationData = data;
    const countries = Object.keys(data);
    countries.forEach(country => {
        const countryLetters = country.split('-').pop().toUpperCase();
        console.log(countryLetters);

        const countryDiv = document.createElement('p');
        const link = document.createElement('a');
        link.innerText = countryLetters;
        link.href = `#${country}`;
        link.setAttribute('data-country', country);
        countryDiv.appendChild(link);

        link.addEventListener('click', function (event) {
            loadStationsData(link.getAttribute('data-country'));
        });

        document.getElementById('country-list').appendChild(countryDiv);
    })
})

document.addEventListener('DOMContentLoaded', function () {
    const playButton = document.getElementById('play-button');
    playButton.innerHTML = playSvg;
    playButton.addEventListener('click', playButtonClicked);

    const slider = document.getElementById('volume-slider');
    const video = document.getElementById('video');
    slider.addEventListener('input', function () {
        video.volume = slider.value / 100;
    });
    slider.value = 100; // Set initial volume to 50%

    const video = document.getElementById('video');
    video.addEventListener('canplay', function () {
        playButton.innerHTML = pauseSvg;
        playButton.classList.remove('loading');
    });

    video.addEventListener('play', function (event) {
        playButton.innerHTML = pauseSvg;
        playButton.classList.remove('loading');
    });
    video.addEventListener('pause', function () {
        playButton.innerHTML = playSvg;
        playButton.classList.remove('loading');
    })
});
