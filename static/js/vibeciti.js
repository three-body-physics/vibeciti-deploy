//////////////////audio//////////////////////
////////////////////////////////////////////

var trackNum, playState, canvas, ctx, source, analyser, context, animationFrame;
//audio track constructor;

function audioTrack(source) {

    // this.image = image || composition[source.getAttribute("data-track")].image;
    this.audio = new Audio();
    this.audio.controls = false;
    this.audio.src = source;
    this.audio.crossorigin = "anonymous";
    this.isPlaying = false;

}

//analyser object constructor;

function analyserObj(audioSource) {

    this.audio = audioSource;
    this.context = new AudioContext();

}


//render method to canvas
analyserObj.prototype.renderBars = function() {

    fbc_array = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(fbc_array);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    bars = 60;

    for (var i = 0; i <= bars; i++) {

        bar_x = (i * 2) + 90;
        bar_width = 1;
        bar_height = (fbc_array[i] / 3);
        ctx.fillRect(bar_x, canvas.height / 2, bar_width, bar_height / 2);

    }
}



analyserObj.prototype.startRender = function() {

    animationFrame = window.requestAnimationFrame(this.startRender.bind(this));

    this.renderBars();

}

//create canvas element, append to DOM and start playing audio
analyserObj.prototype.prepareCanvas = function() {

    var sheet = document.getElementById("sheet");

    while (sheet.firstChild) {
        sheet.removeChild(sheet.firstChild);
    }

    sheet.appendChild(this.audio);

    sheet.getElementsByTagName("audio")[0].play();

    playState = true;

    /////
    canvas = document.createElement("canvas");
    canvas.id = "analyser";
    document.getElementById("sheet").appendChild(canvas);

    ctx = canvas.getContext("2d");
    ctx.shadowBlur = 30;
    ctx.shadowColor = "rgba(255, 255, 255, 1)";
    /////

    this.startRender();
}

//create audio context
analyserObj.prototype.prepareContext = function() {

    this.analyser = this.context.createAnalyser();
    this.source = this.context.createMediaElementSource(this.audio);
    this.source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
}

//track loader constructor;
function trackLoader() {

    this.trackData = [{
            name: "Nana",
            song: "/audio/nana.mp3"
        },
        {
            name: "Nevada",
            song: "/audio/Nevada.mp3"

        },
        {
            name: "Layers",
            song: "/audio/Layers.mp3"

        },
        {
            name: "Recall",
            song: "/audio/Recall.mp3"

        },

        {
            name: "Words",
            song: "/audio/Words.mp3"
        }
    ]

    this.imageData = {

        "Nana": "/images/canvas2.jpg",
        "Nevada": "/images/canvas7.jpg",
        "Layers": "/images/canvas10.png",
        "Recall": "/images/canvas3.jpg",
        "Words": "/images/feint.jpg"

    };

    this.artistData = {
        "Nana": "K.A.R.D",
        "Nevada": "Vicetone",
        "Layers": "RE:Zero",
        "Recall": "K.A.R.D",
        "Words": "Feint"
    };

    this.albumData = {

        "Nana": "/images/album3.jpg",
        "Nevada": "/images/album1.jpg",
        "Layers": "/images/album2.jpg",
        "Recall": "/images/album3.jpg",
        "Words": "/images/album5.jpg"
    };

    this.audioQueue = [];
    this.curSong;
    this.loadedSongs = [];
    this.trackLocations = {};
}

//make a new Audio element and corresponding analyser object with the track loaded. Push the loaded analyser object into an Array.
trackLoader.prototype.addTrack = function(source) {

    var songName = this.trackData[(source - 1)].song;

    this.loadedSongs.push(source);

    var audioSource = new audioTrack(songName);
    var analyser = new analyserObj(audioSource.audio);
    analyser.name = this.trackData[(source - 1)].name;
    this.audioQueue.push(analyser);

    this.mapToArray(songName);

}

trackLoader.prototype.mapToArray = function(songName) {

    this.trackLocations[songName] = this.audioQueue.length - 1;


}

//Call the prepareContext method on analyserObject in the queue and create a new AudioContext with the track loaded.

trackLoader.prototype.prepareTrack = function(num) {

    this.audioQueue[num].prepareContext();

}

//Attach the audio element and canvas onto the play screen.

trackLoader.prototype.playTrack = function(num) {

    this.audioQueue[num].prepareCanvas();

    trackNum = 1;

}

trackLoader.prototype.getSongLocation = function(trackNumber) {
    var songName = this.trackData[(trackNumber - 1)].song;
    return this.trackLocations[songName];
}

//attach event listners to landing page
function init_eventListeners(nodes, queue) {

    var playScreen = document.getElementsByClassName("play-screen");
    var canvas = document.getElementsByClassName("canvas");
    var blurBackground = document.getElementsByClassName("blur-background");
    var songCanvasLocation = {};

    playButton.addEventListener("click", function() {

        var audioEl = sheet.getElementsByTagName("audio");

        if (!playState) {

            audioEl[0].play();
            playState = !playState;
            classie.remove(this, "fa-play-circle");
            classie.add(this, "fa-pause-circle");


        } else {

            audioEl[0].pause();
            playState = !playState;
            classie.remove(this, "fa-pause-circle");
            classie.add(this, "fa-play-circle");           

        }
    });

    var carriers = [].slice.call(nodes); //convert nodelist into array

    for (let i = 0; i < carriers.length; i++) {

        carriers[i].addEventListener("click", function() {

            var trackNumber = this.getAttribute("data-track");
            var songLoc;
            var songName = queue.trackData[trackNumber - 1].name;

            if (queue.loadedSongs.indexOf(trackNumber) == -1) { ///make sure no new audioContext is created for duplicate tracks if there is a duplicate, the canvas screen is brought up again with the previous audio data intact

                queue.addTrack(trackNumber);

                songLoc = queue.getSongLocation(trackNumber); // get the song location in the audioqueue object, this is to map data-track from element with their corresponding location in the array
                songCanvasLocation[songName] = songLoc; // As above function won't be called again when the song is already in the queue, it is important to map their location in a seperate mapping object
                queue.prepareTrack(songLoc);

            }

            queue.playTrack(songCanvasLocation[songName]);

            if (classie.has(playScreen[0], "play-screen--hide")) {

                classie.remove(playScreen[0], "play-screen--hide");
            }

            classie.add(playScreen[0], "play-screen--show");
            var img = queue.imageData[songName];
            blurBackground[0].style.background = "url(" + img + ")";
            var artist = queue.artistData[songName];
            var album = queue.albumData[songName];
            
            showArtist(artist, songName, album);
        });
    }
}

function showArtist(artist, song, album) {

    document.getElementById("album-title").innerHTML = artist;
    document.getElementById("song-title").innerHTML = song;
    document.getElementById("album-thumbnail").style.background = "url(" + album + ")";

}

function attachCanvasBehavior() {

    var playScreen = document.getElementsByClassName("play-screen");
    // var canvas = document.getElementsByClassName("canvas");

    var closebutton = document.getElementById("closebutton");

    closebutton.addEventListener("click", function() {

        if (classie.has(playScreen[0], "play-screen--show")) {
            classie.remove(playScreen[0], "play-screen--show");
        }

        classie.add(playScreen[0], "play-screen--hide");

    });

}

window.onload = function() {
    attachCanvasBehavior();
    var trackCarriers = document.getElementsByClassName("carrier");
    var queue = new trackLoader();
    init_eventListeners(trackCarriers, queue);
}