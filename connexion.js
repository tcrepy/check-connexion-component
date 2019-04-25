import {LitElement, html, css} from "lit-element";

export default class CheckConnexion extends LitElement {
    constructor() {
        super();
        this.tStart = null;
        this.tEnd = null;
        this.image = new Image();
        this.counter = 0;
        this.arrTimes = [];
        this.abortFallback = false;
        this.timeToCount = 3;
        this.threshold = 3000;
        this.offlineTimeout = 3000
    }

    static get properties() {
        return {
            timeToCount: {type: Number},
            threshold: {type: Number},
            offlineTimeout: {type: Number}
        }
    }

    firstUpdated() {
        this.checkConnectivity();
    }

    changeConnectivity(state) {
        const event = new CustomEvent('connection-changed', {
            detail: state
        });
        document.dispatchEvent(event);
        const isDisconnectedDiv = this.shadowRoot.querySelector('.isDisconnected');
        if (!state) {
            isDisconnectedDiv.setAttribute('active', '');
        } else {
            isDisconnectedDiv.removeAttribute('active');
        }
    }

    checkConnectivity() {
        if (navigator.onLine) {
            console.log('online');
            this.changeConnectivity(true);
        } else {
            setTimeout(() => {
                this.changeConnectivity(false);
            }, this.offlineTimeout);
        }

        window.addEventListener('online', e => {
            this.changeConnectivity(true);
        });
        window.addEventListener('offline', e => {
            setTimeout(() => {
                this.changeConnectivity(false);
            }, this.offlineTimeout);
        });

        this.timeoutCallback();
        this.checkLatency(avg => this.handleLatency(avg));
        setInterval(() => {
            this.reset();
            this.timeoutCallback();
            this.checkLatency(avg => this.handleLatency(avg));
        }, 6000)
    }

    checkLatency(callback) {
        this.tStart = new Date().getTime();
        if (this.counter < this.timeToCount) {
            this.image.src = "https://www.google.com/images/phd/px.gif?t=" + this.tStart;
            this.image.onload = (e) => {
                this.abortFallback = true;
                this.tEnd = new Date().getTime();
                let time = this.tEnd - this.tStart;
                this.arrTimes.push(time);
                this.checkLatency(callback);
                this.counter++;
            };
            this.image.offline = () => {
                setTimeout(() => {
                    this.changeConnectivity(false);
                }, this.offlineTimeout);
            }
        } else {
            const sum = this.arrTimes.reduce((a, b) => a + b);
            const avg = sum / this.arrTimes.length;
            callback(avg);
        }
    }

    timeoutCallback() {
        setTimeout(() => {
            if (!this.abortFallback) {
                console.log('Connectivity is too slow, falling back offline experience');
                this.changeConnectivity(false);
            }
        }, this.threshold + 1);
    }

    reset() {
        this.arrTimes = [];
        this.counter = 0;
    }

    handleLatency(avg) {
        const isConnectedFast = avg <= this.threshold;
        if (!isConnectedFast) return this.changeConnectivity(false);
        this.changeConnectivity(true);
    }

    static get styles() {
        return css`
            .connexion > .isDisconnected {
                display: none;
            }
            .connexion > .isDisconnected[active] {
                display: block;
            }
        `
    }

    render() {
        return html`
            <div class="connexion">
                <div>CheckConnexion</div>
                <div class="isDisconnected">Vous êtes déconnecté</div>
            </div>
        `
    }
}

customElements.define('check-connexion', CheckConnexion);