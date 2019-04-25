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
        this.threshold = 2000;
        this.offlineTimeout = 3000;
        this.message = "Disconnected";
        this.timeout = () => {};
    }

    static get properties() {
        return {
            timeToCount: {type: Number},
            threshold: {type: Number},
            offlineTimeout: {type: Number},
            message: {type: Text}
        }
    }

    firstUpdated(_changeProperty) {
        this.checkConnectivity();
    }

    changeConnectivity(state) {
        const event = new CustomEvent('connection-changed', {
            detail: state
        });
        document.dispatchEvent(event);
        const connexionDiv = this.shadowRoot.querySelector('.connexion');
        if (!state) {
            connexionDiv.setAttribute('active', '');
        } else {
            clearTimeout(this.timeout);
            connexionDiv.removeAttribute('active');
        }
    }

    checkConnectivity() {
        if (navigator.onLine) {
            this.changeConnectivity(true);
        } else {
            this.timeout = setTimeout(() => {
                this.changeConnectivity(false);
            }, this.offlineTimeout);
        }

        window.addEventListener('online', e => {
            this.changeConnectivity(true);
        });
        window.addEventListener('offline', e => {
            this.timeout = setTimeout(() => {
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
                this.timeout = setTimeout(() => {
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
        this.timeout = setTimeout(() => {
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
            .connexion {
                --check-connexion-font-size: 2vh;
                --check-connexion-background-color: #d00000;
                --check-connexion-text-color: #ffffff;
                --check-connexion-text-transform: uppercase;
                --check-connexion-height: 50px;
            } 
            
            .connexion {
                height: 0;
                opacity: 0;
                position: fixed;
                line-height: var(--check-connexion-height);
                bottom: 0;
                width: 100%;
                background-color: var(--check-connexion-background-color);
                color: var(--check-connexion-text-color);
                text-align: center;
                padding: 5px;
                transition: 1s all ease-in-out;
                overflow: hidden;
            }
            .connexion[active] {
                height: var(--check-connexion-height);
                opacity: 1;
            }
            .isDisconnected {
                font-size: var(--check-connexion-font-size);
                text-transform: var(--check-connexion-text-transform)
            }
        `;
    }

    render() {
        return html`
            <div class="connexion">
                <div class="isDisconnected">${this.message}</div>
            </div>
        `
    }
}

customElements.define('check-connexion', CheckConnexion);