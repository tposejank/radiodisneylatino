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

let cuedFrames = {}

let lastTime = 0;
let stalledCount = 0;
let checkInterval = null;

function playButtonClicked() {
    const video = document.getElementById('video');
    const playButton = document.getElementById('play-button');

    stalledCount = 0;

    if (window.attachedAudioSource !== window.lastAudioSource) {
        window.lastAudioSource = window.attachedAudioSource;
        const audioStreamUrl = window.attachedAudioSource;

        const ism3u8 = audioStreamUrl.split('?')[0].endsWith('.m3u8');

        rdname = window.stationInfo.title.split(' - ')[0] || 'Radio Disney';

        navigator.mediaSession.metadata = new MediaMetadata({
            title: window.stationInfo.name,
            artist: window.stationInfo.dial,
            album: rdname,
            artwork: [
                {
                    src: "https://rdlatino.festivaltracker.org/RD2048.png",
                    sizes: "2048x2048",
                    type: "image/png",
                },
                {
                    src: "https://rdlatino.festivaltracker.org/RD1024.png",
                    sizes: "1024x1024",
                    type: "image/png",
                },
                {
                    src: "https://rdlatino.festivaltracker.org/RD512.png",
                    sizes: "512x512",
                    type: "image/png",
                },
                {
                    src: "https://rdlatino.festivaltracker.org/RD256.png",
                    sizes: "256x256",
                    type: "image/png",
                },
                {
                    src: "https://rdlatino.festivaltracker.org/RD128.png",
                    sizes: "128x128",
                    type: "image/png",
                },
                {
                    src: "https://rdlatino.festivaltracker.org/RD64.png",
                    sizes: "64x64",
                    type: "image/png",
                },
                {
                    src: "https://rdlatino.festivaltracker.org/RD32.png",
                    sizes: "32x32",
                    type: "image/png",
                }
            ]
        });

        if (ism3u8) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = audioStreamUrl;
                video.addEventListener('loadedmetadata', function () {
                    video.play();
                });
            } else if (Hls.isSupported()) {
                cuedFrames = {}

                var hls = new Hls();
                window.hls = hls;
                hls.loadSource(audioStreamUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });

                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.log("Fatal network error encountered, attempting to reload manifest...");
                                // Optionally add a delay before attempting to reload
                                setTimeout(function () {
                                    hls.loadSource(audioStreamUrl);
                                }, 3000); // Retry after 3 seconds
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log(`Fatal media error encountered:`, data);
                                // You might want to try recovering the media here,
                                // but a full reload of the source might be necessary.
                                hls.recoverMediaError(); // Try to recover media error
                                break;
                            default:
                                console.error(`An unrecoverable fatal error occurred:`, data);
                                hls.destroy();
                                break;
                        }
                    } else {
                        console.log(`Non-fatal error:`, data);
                    }
                })

                hls.on(Hls.Events.FRAG_PARSING_METADATA, (event, data) => {
                    if (data && data.samples) {
                        data.samples.forEach(sample => {
                            // Assuming the metadata you want is in a TXXX frame (User defined text information frame)
                            // and is a string. You might need to inspect the sample.data for other types.
                            try {
                                const decodedData = new TextDecoder().decode(sample.data);
                                const base64Data = btoa(String.fromCharCode(...new Uint8Array(sample.data)));

                                const bytes = new Uint8Array(sample.data);
                                // Parse all TXXX frames and extract key-value pairs into a dictionary
                                const txxxData = {};
                                let tit2 = 'Unknown Title';
                                let tpe1 = 'Unknown Artist';
                                let tlen = '0';
                                let i = 0;
                                while (i < bytes.length - 7) {
                                    // TXXX frame
                                    if (
                                        bytes[i] === 0x54 && // 'T'
                                        bytes[i + 1] === 0x58 && // 'X'
                                        bytes[i + 2] === 0x58 && // 'X'
                                        bytes[i + 3] === 0x58 // 'X'
                                    ) {
                                        // Frame length: next 4 bytes (big-endian)
                                        const n = (bytes[i + 4] << 24) | (bytes[i + 5] << 16) | (bytes[i + 6] << 8) | bytes[i + 7];
                                        // Skip 2 bytes (i+8, i+9)
                                        const frameStart = i + 10;
                                        const frameEnd = frameStart + n;
                                        if (frameEnd > bytes.length) break; // Prevent overflow

                                        // Find first 0x00 after frameStart (start of key)
                                        let keyStart = frameStart;
                                        // The first byte is encoding, skip it
                                        keyStart += 1;
                                        let keyEnd = keyStart;
                                        while (keyEnd < frameEnd && bytes[keyEnd] !== 0x00) keyEnd++;
                                        const key = new TextDecoder().decode(bytes.slice(keyStart, keyEnd));

                                        // Value starts after keyEnd+1, ends at frameEnd
                                        const valueStart = keyEnd + 1;
                                        const value = new TextDecoder().decode(bytes.slice(valueStart, frameEnd));

                                        txxxData[key] = value;

                                        // Move to next possible TXXX frame
                                        i = frameEnd;
                                    }
                                    // TLEN frame
                                    else if (
                                        bytes[i] === 0x54 && // 'T'
                                        bytes[i + 1] === 0x4C && // 'L'
                                        bytes[i + 2] === 0x45 && // 'E'
                                        bytes[i + 3] === 0x4E // 'N'
                                    ) {
                                        const n = (bytes[i + 4] << 24) | (bytes[i + 5] << 16) | (bytes[i + 6] << 8) | bytes[i + 7];
                                        const frameStart = i + 10;
                                        const frameEnd = frameStart + n;
                                        if (frameEnd > bytes.length) break;
                                        // First byte is encoding, skip it
                                        const value = new TextDecoder().decode(bytes.slice(frameStart + 1, frameEnd));
                                        // console.log('TLEN:', value);
                                        tlen = value;
                                        i = frameEnd;
                                    }
                                    // TIT2 frame
                                    else if (
                                        bytes[i] === 0x54 && // 'T'
                                        bytes[i + 1] === 0x49 && // 'I'
                                        bytes[i + 2] === 0x54 && // 'T'
                                        bytes[i + 3] === 0x32 // '2'
                                    ) {
                                        const n = (bytes[i + 4] << 24) | (bytes[i + 5] << 16) | (bytes[i + 6] << 8) | bytes[i + 7];
                                        const frameStart = i + 10;
                                        const frameEnd = frameStart + n;
                                        if (frameEnd > bytes.length) break;
                                        // First byte is encoding, skip it
                                        const value = new TextDecoder().decode(bytes.slice(frameStart + 1, frameEnd));
                                        // console.log('TIT2:', value);
                                        tit2 = value
                                        i = frameEnd;
                                    }
                                    // TPE1 frame
                                    else if (
                                        bytes[i] === 0x54 && // 'T'
                                        bytes[i + 1] === 0x50 && // 'P'
                                        bytes[i + 2] === 0x45 && // 'E'
                                        bytes[i + 3] === 0x31 // '1'
                                    ) {
                                        const n = (bytes[i + 4] << 24) | (bytes[i + 5] << 16) | (bytes[i + 6] << 8) | bytes[i + 7];
                                        const frameStart = i + 10;
                                        const frameEnd = frameStart + n;
                                        if (frameEnd > bytes.length) break;
                                        // First byte is encoding, skip it
                                        const value = new TextDecoder().decode(bytes.slice(frameStart + 1, frameEnd));
                                        // console.log('TPE1:', value);
                                        tpe1 = value;
                                        i = frameEnd;
                                    }
                                    else {
                                        i++;
                                    }
                                }

                                if (txxxData['cue_id']) {
                                    start = txxxData['cue_time_start'] || `${Date.now()}`;

                                    cuedFrames[txxxData['cue_id']] = {
                                        start: parseFloat(start),
                                        type: txxxData['cue_type'],
                                        length: parseFloat(tlen),
                                        artist: tpe1,
                                        title: tit2,
                                    };
                                    // console.log('Cued frames:', cuedFrames);
                                } else if (tit2 !== 'Unknown Title') {
                                    cuedFrames[tit2] = {
                                        start: Date.now(),
                                        type: 'track',
                                        length: parseFloat(tlen),
                                        artist: tpe1,
                                        title: tit2,
                                    };
                                }

                                // console.log('TXXX frames:', txxxData);

                                // console.log('ID3 Metadata (base64):', base64Data);
                            } catch (e) {
                                console.error('Error decoding ID3 metadata:', e);
                            }
                        });
                    }
                });

                setInterval(() => {
                    const now = Date.now();
                    const currentTime = Date.now();
                    // Find the currently playing cue based on start and length
                    let currentCue = Object.values(cuedFrames).find(cue => {
                        let cueEnd = cue.start + cue.length;
                        return currentTime >= cue.start && currentTime < cueEnd;
                    });

                    if (!currentCue) {
                        // Find the cue with the closest end time to currentTime (even if already ended)
                        let cues = Object.values(cuedFrames);
                        if (cues.length > 0) {
                            currentCue = cues.reduce((closest, cue) => {
                                let cueEnd = cue.start + cue.length;
                                let diff = Math.abs(cueEnd - currentTime);
                                if (!closest) return cue;
                                let closestEnd = closest.start + closest.length;
                                let closestDiff = Math.abs(closestEnd - currentTime);
                                return diff < closestDiff ? cue : closest;
                            }, null);
                        }
                    }

                    // console.log('Current cue:', currentCue);
                    // if (currentCue) {
                    // console.log('Start:', currentCue.start, 'Ends: ' + (currentCue.start + currentCue.length), 'Ends in:', (currentCue.start + currentCue.length) - currentTime, 'ms', 'Length:', currentCue.length, 'ms');
                    // }

                    if (currentCue) {
                        if (!navigator.mediaSession.metadata ||
                            navigator.mediaSession.metadata.title !== currentCue.title ||
                            navigator.mediaSession.metadata.artist !== currentCue.artist) {

                            const playerStationInfo = document.getElementById('player-station-track-title');
                            const playerStationArtist = document.getElementById('player-station-track-artist');
                            playerStationInfo.innerText = currentCue.title;
                            playerStationArtist.innerText = currentCue.artist;

                            navigator.mediaSession.metadata = new MediaMetadata({
                                title: currentCue.title,
                                artist: currentCue.artist,
                                artwork: [
                                    {
                                        src: "https://rdlatino.festivaltracker.org/RD2048.png",
                                        sizes: "2048x2048",
                                        type: "image/png",
                                    },
                                    {
                                        src: "https://rdlatino.festivaltracker.org/RD1024.png",
                                        sizes: "1024x1024",
                                        type: "image/png",
                                    },
                                    {
                                        src: "https://rdlatino.festivaltracker.org/RD512.png",
                                        sizes: "512x512",
                                        type: "image/png",
                                    },
                                    {
                                        src: "https://rdlatino.festivaltracker.org/RD256.png",
                                        sizes: "256x256",
                                        type: "image/png",
                                    },
                                    {
                                        src: "https://rdlatino.festivaltracker.org/RD128.png",
                                        sizes: "128x128",
                                        type: "image/png",
                                    },
                                    {
                                        src: "https://rdlatino.festivaltracker.org/RD64.png",
                                        sizes: "64x64",
                                        type: "image/png",
                                    },
                                    {
                                        src: "https://rdlatino.festivaltracker.org/RD32.png",
                                        sizes: "32x32",
                                        type: "image/png",
                                    }
                                ]
                            });
                        }
                    }
                }, 100)
            }
        } else {
            video.src = audioStreamUrl;
            video.addEventListener('loadedmetadata', function () {
                video.play();
            });

            video.addEventListener("playing", () => {
                console.log("Playing");
                stalledCount = 0;
            });

            video.addEventListener("error", (e) => {
                console.warn("Audio error:", e);
            });

            if (checkInterval) clearInterval(checkInterval);
            checkInterval = setInterval(() => {
                if (video.currentTime === lastTime) {
                    stalledCount++;
                    console.log(`Stalled for ${stalledCount} cycles`);
                    if (stalledCount >= 3) {
                        window.lastAudioSource = null;
                        playButtonClicked();
                    }
                }

                if (!video.paused) {
                    stalledCount = 0;
                }

                lastTime = video.currentTime;
            }, 1000);
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
    console.log(stationData);
    window.stationInfo = stationData;
    console.log('play ' + stationData.name);

    const playButton = document.getElementById('play-button');
    video.pause();
    if (window.hls) {
        window.hls.destroy();
    }
    playButton.innerHTML = playSvg;

    const playerStationInfo = document.getElementById('player-station-track-title');
    playerStationInfo.innerText = stationData.name + ' ' + stationData.dial;
    const playerStationArtist = document.getElementById('player-station-track-artist');
    playerStationArtist.innerText = 'Radio Disney';
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

        // const playButton = document.createElement('button');
        // playButton.innerHTML = downloadSvg;
        // playButton.classList.add('load-button');
        stationDiv.addEventListener('click', function () {
            playStation(station);
            title = 'Radio Disney ' + countryCode;
            path = '?country=' + countryCode + '&id=' + station.id;
            history.pushState({ page: title }, title, path);
        });
        stationDiv.setAttribute('data-station-id', station.id);

        // stationControls.appendChild(playButton);
        stationControls.appendChild(stationInfo);
        stationDiv.appendChild(stationControls);
        stationList.appendChild(stationDiv);
    })

    url = window.location.search;
    params = new URLSearchParams(url);
    if (params.get('id')) {
        for (let child of stationList.children) {
            if (child.getAttribute('data-station-id') === params.get('id')) {
                child.click();
                video.play();
                break;
            }
        }
    }
}

fetch('/stations.json').then(response => response.json())
    .then(data => {
        data['TR'] = [
            {
                id: 'tropicalida-ec',
                streamingUrl: 'https://live.airstream.run/alba-ec-tropicalida-tropicalida/index.m3u8',
                name: 'Tropicalida',
                dial: '91.3 FM',
                title: 'Tropicalida EC'
            }
        ]

        data['AL'] = [
            {
                id: 'alfa-radio-ec',
                streamingUrl: 'https://d2oubcpl50vyui.cloudfront.net/index.m3u8',
                name: 'Alfa Radio',
                dial: '104.1 FM',
                title: 'Alfa Radio EC'
            }
        ]

        window.stationData = data;
        const countries = Object.keys(data);
        countries.forEach(country => {
            const countryLetters = country.toUpperCase();
            // console.log(countryLetters);

            const countryDiv = document.createElement('a');
            const link = document.createElement('a');
            link.innerText = countryLetters;
            link.href = `?country=${country}`;
            link.setAttribute('data-country', country);
            countryDiv.appendChild(link);

            link.addEventListener('click', function (event) {
                event.preventDefault();
                path = event.target.getAttribute('href');
                title = 'Radio Disney ' + countryLetters;
                history.pushState({ page: title }, title, path);
                loadStationsData(link.getAttribute('data-country'));
            });

            document.getElementById('country-list').appendChild(countryDiv);
        })

        url = window.location.search;
        params = new URLSearchParams(url);
        if (params.get('country')) {
            loadStationsData(params.get('country'));
        }
    })

document.addEventListener('DOMContentLoaded', function () {
    const playButton = document.getElementById('play-button');
    playButton.innerHTML = playSvg;
    playButton.addEventListener('click', playButtonClicked);

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
