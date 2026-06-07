import BackgroundMusic from "../assets/welcome/Pocket Music.mp3";

class AudioManager {
    private audio: HTMLAudioElement | null = null;
    private started: boolean = false;
    private muted: boolean = false;

    init() {
        if (!this.audio) {
            this.audio = new Audio(BackgroundMusic);
            this.audio.loop = true;
            this.audio.volume = 0.4;
            this.audio.muted = this.muted;
        }
    }

    play() {
        this.init();
        if (this.audio) {
            this.audio.play().catch(console.error);
            this.started = true;
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }

    toggleMute() {
        this.init();
        if (this.audio) {
            if (!this.started) {
                this.play();
                this.muted = false;
                this.audio.muted = false;
            } else {
                this.muted = !this.muted;
                this.audio.muted = this.muted;
            }
        }
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }

    hasStarted() {
        return this.started;
    }
}

export const globalAudio = new AudioManager();
